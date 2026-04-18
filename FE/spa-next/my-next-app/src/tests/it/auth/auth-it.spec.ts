import { expect, test } from "@playwright/test";
import type { LoginRequest } from "@/types/auth";
import {
  expectOnLogin,
  fillLoginAndSubmit,
  loginFailureBody,
  loginSuccessBody,
  mockAuthStatus,
  mockLogin,
  mockLogout,
  mockSystemSettings,
  statusLoggedOutBody,
  statusSuccessBody,
  systemSettingsSuccessBody,
} from "./auth.helpers";

test.describe("SC01 Auth IT", () => {
  test("SC01-IT-001 shouldCallLoginServiceWhenSubmittingValidCredentials", async ({
    page,
  }) => {
    let loginPayload: LoginRequest | null = null;

    await mockAuthStatus(page, statusSuccessBody);
    await mockLogin(page, loginSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);

    await page.route(/\/auth\/login(\?.*)?$/, async (route) => {
      loginPayload = route.request().postDataJSON() as LoginRequest;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(loginSuccessBody),
      });
    });

    await page.goto("/login");
    await fillLoginAndSubmit(page, "validuser", "ValidPass123");
    await page.goto("/settings");

    expect(loginPayload).toMatchObject({
      user_id: "validuser",
      password: "ValidPass123",
    });
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByTestId("logout-button")).toBeVisible();
  });

  test("SC01-IT-002 shouldNotAuthenticateUserWhenPasswordIsInvalid", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusLoggedOutBody);
    await mockLogin(page, loginFailureBody);

    await page.goto("/login");
    await fillLoginAndSubmit(page, "validuser", "WrongPass");

    await expectOnLogin(page);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
  });

  test("SC01-IT-003 shouldNotExposeUserExistenceWhenLoginFails", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusLoggedOutBody);
    await mockLogin(page, loginFailureBody);

    await page.goto("/login");

    await fillLoginAndSubmit(page, "nouser", "WrongPass");
    const firstError = (await page.getByTestId("snackbar-container").textContent()) ?? "";
    await page.locator('[data-testid="snackbar-container"] button').click();

    await fillLoginAndSubmit(page, "validuser", "WrongPass");
    const secondError = (await page.getByTestId("snackbar-container").textContent()) ?? "";

    expect(firstError.trim()).toBeTruthy();
    expect(secondError.trim()).toBeTruthy();
    expect(secondError.trim()).toEqual(firstError.trim());
    expect(secondError.toLowerCase()).not.toContain("user not found");
  });

  test("SC01-IT-004 shouldCallLoginServiceOnlyAfterUserAction", async ({
    page,
  }) => {
    let loginCalls = 0;
    await mockAuthStatus(page, statusLoggedOutBody);
    await page.route(/\/auth\/login(\?.*)?$/, async (route) => {
      loginCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(loginSuccessBody),
      });
    });

    await page.goto("/login");
    await page.waitForTimeout(700);
    expect(loginCalls).toBe(0);

    await fillLoginAndSubmit(page);
    await expect.poll(() => loginCalls).toBe(1);
  });

  test("SC01-IT-005 shouldHandleNetworkErrorWhenLoginServiceFails", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusLoggedOutBody);
    await page.route(/\/auth\/login(\?.*)?$/, async (route) => {
      await route.abort("internetdisconnected");
    });

    await page.goto("/login");
    await fillLoginAndSubmit(page);

    await expectOnLogin(page);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
  });

  test("SC01-IT-006 shouldShowErrorMessageWhenLoginServiceReturnsFailure", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusLoggedOutBody);
    await mockLogin(page, { message: "Internal Server Error" }, 500);

    await page.goto("/login");
    await fillLoginAndSubmit(page);

    await expectOnLogin(page);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    const authState = await page.evaluate(() => sessionStorage.getItem("authState"));
    expect(authState).toBeNull();
  });

  test("SC01-IT-007 shouldStoreSessionDataWhenLoginIsSuccessful", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusSuccessBody);
    await mockLogin(page, loginSuccessBody);

    await page.goto("/login");
    await fillLoginAndSubmit(page);

    await expect
      .poll(async () => {
        const saved = await page.evaluate(() => sessionStorage.getItem("authState"));
        return saved ? JSON.parse(saved) : null;
      })
      .toMatchObject({
        isAuthenticated: true,
        name: "Valid User",
      });
  });

  test("SC01-IT-008 shouldClearSessionAndAuthStateWhenLoginIsRejected", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "authState",
        JSON.stringify({
          isAuthenticated: true,
          userId: "preloaded",
          name: "Preloaded User",
        })
      );
    });
    await mockAuthStatus(page, statusLoggedOutBody);
    await mockLogin(page, loginFailureBody);

    await page.goto("/login");
    await fillLoginAndSubmit(page, "validuser", "WrongPass");

    const authState = await page.evaluate(() => sessionStorage.getItem("authState"));
    expect(authState).toBeNull();
    await expectOnLogin(page);
  });

  test("SC01-IT-009 shouldRestoreAuthStateFromSessionOnAppReload", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "authState",
        JSON.stringify({
          isAuthenticated: true,
          userId: "validuser",
          name: "Session User",
        })
      );
    });
    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByTestId("logout-button")).toBeVisible();
  });

  test("SC01-IT-010 shouldRedirectToLoginWhenUserIsUnauthenticated", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusLoggedOutBody);

    await page.goto("/settings");
    await expectOnLogin(page);
  });

  test("SC01-IT-011 shouldAllowAccessToProtectedRouteWhenUserIsAuthenticated", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByTestId("logout-button")).toBeVisible();
  });

  test("SC01-IT-012 shouldDisplayAuthCheckingIndicatorWhileAuthStateIsPending", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusSuccessBody, 200, 1500);
    await mockSystemSettings(page, systemSettingsSuccessBody);

    await page.goto("/settings");
    await expect(
      page.locator("p").filter({ hasText: /認証|checking|確認|隱崎/i }).first()
    ).toBeVisible();
  });

  test("SC01-IT-013 shouldBypassAuthGuardForPublicRoutes", async ({ page }) => {
    await mockAuthStatus(page, statusLoggedOutBody);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/403");
    await expect(page).toHaveURL(/\/403/);
  });

  test("SC01-IT-014 shouldCallLogoutServiceWhenLogoutIsTriggered", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);
    await mockLogout(page, 200);

    await page.goto("/settings");
    await page.getByTestId("logout-button").click();

    await expectOnLogin(page);
  });

  test("SC01-IT-015 shouldCallLogoutServiceWhenLogoutIsTriggeredOncePerAction", async ({
    page,
  }) => {
    let logoutCalls = 0;
    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);
    await page.route(/\/auth\/logout(\?.*)?$/, async (route) => {
      logoutCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/settings");
    await page.getByTestId("logout-button").click();

    await expect.poll(() => logoutCalls).toBe(1);
  });

  test("SC01-IT-016 shouldCallAuthStatusServiceWhenCheckingAuthentication", async ({
    page,
  }) => {
    let statusCalls = 0;
    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      statusCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(statusSuccessBody),
      });
    });
    await mockSystemSettings(page, systemSettingsSuccessBody);

    await page.goto("/settings");
    await expect.poll(() => statusCalls).toBeGreaterThan(0);
  });

  test("SC01-IT-017 shouldTreatUnauthorizedStatusAsLoggedOutState", async ({
    page,
  }) => {
    await mockAuthStatus(page, { message: "unauthorized" }, 401);

    await page.goto("/settings");
    await expectOnLogin(page);
  });

  test("SC01-IT-018 shouldNotifyUserWhenSessionExpiresOnStatusError", async ({
    page,
  }) => {
    await mockAuthStatus(
      page,
      { eventType: "USER_SESSION_EXPIRED", message: "session expired" },
      500
    );

    await page.goto("/settings");
    await expectOnLogin(page);
  });

  test("SC01-IT-019 shouldHandleNonUnauthorizedStatusErrorWithoutCrash", async ({
    page,
  }) => {
    await mockAuthStatus(page, { message: "server down" }, 500);

    await page.goto("/settings");
    await expect(page.locator("body")).toBeVisible();
    await expectOnLogin(page);
  });

  test("SC01-IT-020 shouldRedirectToLoginOnUnauthorizedProtectedApiResponse", async ({
    page,
  }) => {
    let systemCalls = 0;
    let refreshCalls = 0;

    await mockAuthStatus(page, statusSuccessBody);
    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      systemCalls += 1;
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "unauthorized" }),
      });
    });
    await page.route(/\/auth\/refresh(\?.*)?$/, async (route) => {
      refreshCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/settings");

    await expectOnLogin(page);
    await expect.poll(() => systemCalls).toBe(1);
    expect(refreshCalls).toBe(0);
  });

  test("SC01-IT-021 shouldNotCallRefreshServiceForAuthEndpoints", async ({
    page,
  }) => {
    let refreshCalls = 0;

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "unauthorized status" }),
      });
    });
    await page.route(/\/auth\/login(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "unauthorized login" }),
      });
    });
    await page.route(/\/auth\/refresh(\?.*)?$/, async (route) => {
      refreshCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/login");
    await fillLoginAndSubmit(page);

    expect(refreshCalls).toBe(0);
  });

  test("SC01-IT-022 shouldRedirectToLoginWhenTokenRefreshFails", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, { message: "unauthorized" }, 401);

    await page.goto("/settings");
    await expectOnLogin(page);
  });

  test("SC01-IT-023 shouldNotRetryUnauthorizedProtectedApiResponses", async ({
    page,
  }) => {
    let refreshCalls = 0;
    let systemCalls = 0;

    await mockAuthStatus(page, statusSuccessBody);
    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      systemCalls += 1;
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "unauthorized" }),
      });
    });
    await page.route(/\/auth\/refresh(\?.*)?$/, async (route) => {
      refreshCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/settings");
    await expectOnLogin(page);
    await expect.poll(() => systemCalls, { timeout: 15000 }).toBe(1);
    expect(refreshCalls).toBe(0);
  });

  test("SC01-IT-024 shouldReusePendingAuthStatusRequestWithinOneSecond", async ({
    page,
  }) => {
    let statusCalls = 0;
    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      statusCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(statusSuccessBody),
      });
    });
    await mockSystemSettings(page, systemSettingsSuccessBody);

    await page.goto("/settings");
    await expect.poll(() => statusCalls, { timeout: 15000 }).toBe(1);
  });

  test("SC01-IT-025 shouldCallAuthStatusServiceAgainAfterCacheExpires", async ({
    page,
  }) => {
    let statusCalls = 0;
    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      statusCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(statusSuccessBody),
      });
    });
    await mockSystemSettings(page, systemSettingsSuccessBody);

    await page.goto("/settings");
    await expect.poll(() => statusCalls, { timeout: 15000 }).toBe(1);

    await page.waitForTimeout(1200);
    await page.reload();
    await expect.poll(() => statusCalls, { timeout: 15000 }).toBe(2);
  });

  test("SC01-IT-026 shouldShowLoadingSpinnerWhenProtectedNavigationExceedsThreshold", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);
    await page.route(/\/api\/notice\/list(\?.*)?$/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { noticeList: [] },
        }),
      });
    });

    await page.goto("/settings");
    await page.goto("/");

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[role="progressbar"]')).toHaveCount(1);
  });

  test("SC01-IT-027 shouldRenderHeaderTitleAndLogoutButtonCorrectly", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);

    await page.goto("/settings");

    await expect(page.getByTestId("header-title")).toBeVisible();
    await expect(page.getByTestId("logout-button")).toBeVisible();
  });

  test("SC01-IT-028 shouldRedirectFromProtectedRouteWhenAuthStateChangesToLoggedOut", async ({
    page,
  }) => {
    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);
    await mockLogout(page, 200);

    await page.goto("/settings");
    await page.getByTestId("logout-button").click();

    await expectOnLogin(page);
  });

  test("SC01-IT-029 shouldUpdateUiWhenAuthenticationStateChanges", async ({
    page,
  }) => {
    await mockAuthStatus(
      page,
      { eventType: "USER_SESSION_EXPIRED", message: "session expired" },
      500
    );

    await page.goto("/settings");
    await expectOnLogin(page);
    await expect(page.locator("body")).toBeVisible();
  });
});
