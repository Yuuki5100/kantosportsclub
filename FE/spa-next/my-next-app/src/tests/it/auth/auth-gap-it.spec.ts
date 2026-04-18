import { expect, test } from "@playwright/test";
import {
  expectOnLogin,
  fillLoginAndSubmit,
  loginSuccessBody,
  mockAuthStatus,
  mockSystemSettings,
  statusLoggedOutBody,
  statusSuccessBody,
  systemSettingsSuccessBody,
} from "./auth.helpers";

async function mockTopNoticeList(page: any) {
  await page.route(/\/api\/notice\/list(\?.*)?$/, async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { noticeList: [] } }),
    });
  });
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe("SC01 Auth Session Gap IT", () => {
  test("SC01-IT-030 shouldPreventDuplicateLoginSubmission", async ({ page }) => {
    let loginCalls = 0;

    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);
    await mockTopNoticeList(page);
    await page.route(/\/auth\/login(\?.*)?$/, async (route) => {
      loginCalls += 1;
      await delay(1200);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(loginSuccessBody),
      });
    });

    await page.goto("/login");
    const submitButton = page.locator('button[type="submit"]');
    await page.locator('input[name="username"]').fill("validuser");
    await page.locator('input[name="password"]').fill("ValidPass123");
    await submitButton.dblclick();

    await expect(submitButton).toBeDisabled();
    await expect.poll(() => loginCalls, { timeout: 15000 }).toBe(1);
  });

  test("SC01-IT-031 shouldPreventDuplicateForgotPasswordSubmission", async ({
    page,
  }) => {
    let calls = 0;

    await page.route(/\/api\/user\/forgot-password(\?.*)?$/, async (route) => {
      calls += 1;
      await delay(1200);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await page.goto("/forgot-password");
    const submitButton = page.locator('button[type="submit"]');
    await page.locator('input[name="email"]').fill("taro.yamada@example.com");
    await submitButton.dblclick();

    await expect(submitButton).toBeDisabled();
    await expect.poll(() => calls, { timeout: 15000 }).toBe(1);
  });

  test("SC01-IT-032 shouldPreventDuplicateResetPasswordSubmission", async ({ page }) => {
    let calls = 0;

    await page.route(/\/api\/user\/reset-password\/[^/]+(\?.*)?$/, async (route) => {
      calls += 1;
      await delay(1200);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await page.goto("/reset-password/RST-DUP-0001");
    const submitButton = page.locator('button[type="submit"]');
    await page.locator('input[name="password"]').fill("Aa1!Aa1!Aa1!aa");
    await page.locator('input[name="confirmPassword"]').fill("Aa1!Aa1!Aa1!aa");
    await submitButton.dblclick();

    await expect(submitButton).toBeDisabled();
    await expect.poll(() => calls, { timeout: 15000 }).toBe(1);
  });

  test("SC01-IT-033 shouldBlockProtectedRouteAfterLogout", async ({ page }) => {
    let loggedOut = false;

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      const body = loggedOut ? statusLoggedOutBody : statusSuccessBody;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
    await mockSystemSettings(page, systemSettingsSuccessBody);
    await page.route(/\/auth\/logout(\?.*)?$/, async (route) => {
      loggedOut = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/settings");
    await page.getByTestId("logout-button").click();
    await expectOnLogin(page);

    await page.goto("/settings");
    await expectOnLogin(page);
  });

  test("SC01-IT-034 shouldRedirectToLoginWhenSessionExpiresOnProtectedPageRecheck", async ({
    page,
  }) => {
    let statusCalls = 0;

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      statusCalls += 1;
      if (statusCalls === 1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(statusSuccessBody),
        });
        return;
      }

      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          eventType: "USER_SESSION_EXPIRED",
          message: "session expired",
        }),
      });
    });
    await mockSystemSettings(page, systemSettingsSuccessBody);

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);

    await page.reload();
    await expectOnLogin(page);
  });

  test("SC01-IT-035 shouldKeepSessionAcrossProtectedPageNavigation", async ({ page }) => {
    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);
    await mockTopNoticeList(page);

    await page.goto("/settings");
    await expect(page.getByTestId("logout-button")).toBeVisible();

    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("logout-button")).toBeVisible();

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByTestId("logout-button")).toBeVisible();
  });

  test("SC01-IT-036 shouldAllowRetryAfterAuthApiTimeoutStyleFailure", async ({ page }) => {
    let loginCalls = 0;

    await mockAuthStatus(page, statusSuccessBody);
    await mockSystemSettings(page, systemSettingsSuccessBody);
    await mockTopNoticeList(page);
    await page.route(/\/auth\/login(\?.*)?$/, async (route) => {
      loginCalls += 1;
      if (loginCalls === 1) {
        await route.fulfill({
          status: 504,
          contentType: "application/json",
          body: JSON.stringify({ message: "timeout" }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(loginSuccessBody),
      });
    });

    await page.goto("/login");
    const submitButton = page.locator('button[type="submit"]');

    await fillLoginAndSubmit(page, "validuser", "ValidPass123");
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(submitButton).toBeEnabled();

    await fillLoginAndSubmit(page, "validuser", "ValidPass123");
    await expect.poll(() => loginCalls).toBe(2);
    await expect(page.getByTestId("logout-button")).toBeVisible();
  });

  test("SC01-IT-037 shouldLoadAuthRequestsUsingConfiguredApiBaseUrl", async ({ page }) => {
    const expectedBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8888";
    let requestedUrl = "";

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      requestedUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(statusLoggedOutBody),
      });
    });

    await page.goto("/login");
    await expect.poll(() => requestedUrl).not.toBe("");
    expect(requestedUrl.startsWith(expectedBaseUrl)).toBeTruthy();
  });

});
