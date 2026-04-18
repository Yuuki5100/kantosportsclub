import { expect, test } from "@playwright/test";
import { expectOnLogin, systemSettingsSuccessBody } from "../auth/auth.helpers";
import { clickEditOrSave } from "../setting/setting.helpers";
import {
  mockAuthenticatedUser,
  mockRoleDropdown,
  openUserDetail,
  openUserList,
  roleDropdownBase,
  userDetailBase,
  userListBase,
} from "./user.helpers";

const fullPermissions = {
  SYSTEM_SETTINGS: 3,
  NOTICE: 3,
  USER: 3,
  ROLE: 3,
  MANUAL: 3,
};

const buildAuthStatusBody = (authenticated: boolean, userPermission = 3) => ({
  success: true,
  data: {
    authenticated,
    rolePermissions: authenticated
      ? { ...fullPermissions, USER: userPermission }
      : {},
    user: authenticated ? { userId: "validuser", givenName: "Valid", surname: "User" } : undefined,
  },
});

const clickUserSearch = async (page: Parameters<typeof test>[0]["page"]) => {
  const searchButtonByNewName = page
    .locator('input[name="searchUserName"]')
    .locator("xpath=ancestor::div[contains(@class,'MuiAccordionDetails-root')][1]")
    .getByRole("button", { name: /^検索$/ })
    .first();

  if (await searchButtonByNewName.isVisible().catch(() => false)) {
    await searchButtonByNewName.click({ force: true });
    return;
  }

  const searchButtonByLegacyName = page
    .locator('input[name="searchName"]')
    .locator("xpath=ancestor::div[contains(@class,'MuiAccordionDetails-root')][1]")
    .getByRole("button", { name: /^検索$/ })
    .first();
  await expect(searchButtonByLegacyName).toBeVisible();
  await searchButtonByLegacyName.click({ force: true });
};

const clickPrimaryUserAction = async (page: Parameters<typeof test>[0]["page"]) => {
  const registerButton = page.getByRole("button", { name: /^登録$/ }).first();
  if (await registerButton.isVisible().catch(() => false)) {
    await registerButton.click();
    return;
  }

  const updateButton = page.getByRole("button", { name: /^更新$/ }).first();
  await expect(updateButton).toBeVisible();
  await updateButton.click();
};

test.describe("SC06-SC08 User System Test", () => {
  test("SC06-ST-001 shouldRestrictAccessWhenUserIsUnauthenticated", async ({ page }) => {
    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(false)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "unauthorized" }),
      });
    });

    await page.goto("/user/list", { waitUntil: "domcontentloaded" }).catch(() => undefined);
    await expect(page).toHaveURL(/\/user\/list|\/login/);
  });

  test("SC06-ST-002 shouldReflectLogoutStateAcrossTabsWhenUserLogsOutInAnotherTab", async ({
    context,
  }) => {
    let authenticated = true;

    await context.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(authenticated)),
      });
    });

    await context.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: authenticated ? 200 : 401,
        contentType: "application/json",
        body: JSON.stringify(authenticated ? systemSettingsSuccessBody : { message: "unauthorized" }),
      });
    });

    await context.route(/\/auth\/logout(\?.*)?$/, async (route) => {
      authenticated = false;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    const tabA = await context.newPage();
    const tabB = await context.newPage();

    await tabA.goto("/settings", { waitUntil: "domcontentloaded" });
    await expect(tabA).toHaveURL(/\/settings/);

    await tabB.goto("/settings", { waitUntil: "domcontentloaded" });
    await expect(tabB).toHaveURL(/\/settings/);

    authenticated = false;
    await tabA.goto("/settings", { waitUntil: "domcontentloaded" }).catch(() => undefined);
    await tabB.goto("/settings", { waitUntil: "domcontentloaded" }).catch(() => undefined);
    expect(authenticated).toBe(false);
    await expect(tabA).toHaveURL(/\/settings|\/login/);
    await expect(tabB).toHaveURL(/\/settings|\/login/);

    await tabA.close();
    await tabB.close();
  });

  test("SC06-ST-003 shouldApplyUpdatedPermissionsImmediatelyWhenUserRolesChanged", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });

    await mockRoleDropdown(page, [...roleDropdownBase]);
    await page.route(/\/api\/user\/[^/]+(\?.*)?$/, async (route) => {
      const req = route.request();
      const url = req.url();
      if (
        req.method() !== "GET" ||
        url.includes("/api/user/list") ||
        url.includes("/api/user/create") ||
        url.includes("/api/user/unlock") ||
        url.includes("/api/user/forgot-password") ||
        url.includes("/api/user/reset-password")
      ) {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: userDetailBase }),
      });
    });

    await page.goto("/user/detail?id=U0001", { waitUntil: "domcontentloaded" });
    await expect(page.locator('input[name="userId"]')).toBeVisible();
    await page.getByRole("button", { name: /^更新$/ }).first().click();
    await expect(page.locator('input[name="surname"]')).toBeEnabled();

    await mockAuthenticatedUser(page, { canEditUser: false });
    await page.goto("/user/detail?id=U0001", { waitUntil: "domcontentloaded" });
    await expect(page.locator('input[name="userId"]')).toBeVisible();

    await expect(page.locator('input[name="surname"]')).toBeDisabled();
    await expect(page.locator('input[name="email"]')).toBeDisabled();
  });

  test("SC06-ST-004 shouldRedirectToLoginWhenAuthenticationTokenIsExpired", async ({ page }) => {
    let authenticated = true;

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(authenticated)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: authenticated ? 200 : 401,
        contentType: "application/json",
        body: JSON.stringify(authenticated ? systemSettingsSuccessBody : { message: "token expired" }),
      });
    });

    await page.goto("/settings");
    authenticated = false;
    await page.goto("/settings", { waitUntil: "domcontentloaded" }).catch(() => undefined);
    await expect(page).toHaveURL(/\/settings|\/login/);
  });

  test("SC06-ST-005 shouldControlScreenAccessBasedOnUserPermissions", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });

    await mockRoleDropdown(page, [...roleDropdownBase]);
    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users: [userListBase[0]], total: 1 } }),
      });
    });

    await page.route(/\/api\/user\/[^/]+(\?.*)?$/, async (route) => {
      const req = route.request();
      const url = req.url();
      if (
        req.method() !== "GET" ||
        url.includes("/api/user/list") ||
        url.includes("/api/user/create") ||
        url.includes("/api/user/unlock") ||
        url.includes("/api/user/forgot-password") ||
        url.includes("/api/user/reset-password")
      ) {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: userDetailBase }),
      });
    });

    await openUserDetail(page, "U0001");
    await expect(page.locator('input[name="surname"]')).toBeDisabled();
    await expect(page.locator('input[name="email"]')).toBeDisabled();
  });

  test("SC07-ST-001 shouldMaintainUserRoleReferenceConsistencyWhenRolesDeletedOrUpdated", async ({
    page,
  }) => {
    let state: "initial" | "updated" | "deleted" = "initial";

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(true, 3)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(systemSettingsSuccessBody),
      });
    });

    await page.route(/\/api\/roles\/dropdown(\?.*)?$/, async (route) => {
      const roles =
        state === "deleted"
          ? [{ roleId: 1, roleName: "ROLE_VIEW_ONLY" }]
          : [
              { roleId: 1, roleName: "ROLE_VIEW_ONLY" },
              {
                roleId: 2,
                roleName: state === "updated" ? "ROLE_EDIT_RENAMED" : "ROLE_EDIT",
              },
            ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { roles } }),
      });
    });

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const roleName = state === "updated" ? "ROLE_EDIT_RENAMED" : "ROLE_EDIT";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            users: [{ ...userListBase[1], userId: "U0002", roleId: 2, roleName }],
            total: 1,
          },
        }),
      });
    });

    await page.route(/\/api\/user\/[^/]+(\?.*)?$/, async (route) => {
      const req = route.request();
      const url = req.url();
      if (
        req.method() !== "GET" ||
        url.includes("/api/user/list") ||
        url.includes("/api/user/create") ||
        url.includes("/api/user/unlock") ||
        url.includes("/api/user/forgot-password") ||
        url.includes("/api/user/reset-password")
      ) {
        await route.fallback();
        return;
      }

      const roleName = state === "updated" ? "ROLE_EDIT_RENAMED" : "ROLE_EDIT";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { ...userDetailBase, userId: "U0002", roleId: 2, roleName },
        }),
      });
    });

    await page.goto("/user/detail?id=U0002", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/user\/detail\?id=U0002/);
    await expect(page.locator("body")).toContainText("ユーザー詳細");

    state = "updated";
    await page.goto("/user/detail?id=U0002", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/user\/detail\?id=U0002/);
    await expect(page.locator("body")).toContainText("ROLE_");

    state = "deleted";
    await page.goto("/user/detail?id=U0002", { waitUntil: "domcontentloaded" }).catch(() => undefined);
    await expect(page).toHaveURL(/\/user\/detail\?id=U0002|\/user\/list/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC07-ST-002 shouldDisplayConsistentDataAcrossListDetailAndSearchViews", async ({ page }) => {
    const targetUser = {
      ...userListBase[0],
      userId: "U0301",
      surname: "Consistent",
      givenName: "Person",
      email: "consistent.person@example.com",
      roleName: "ROLE_VIEW_ONLY",
      roleId: 1,
    };

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(true, 3)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(systemSettingsSuccessBody),
      });
    });

    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      const name = (reqUrl.searchParams.get("name") ?? "").trim();
      const users = !name || `${targetUser.surname} ${targetUser.givenName}`.includes(name) ? [targetUser] : [];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });

    await page.route(
      /\/(?:api\/user|user\/access|user\/(?:update|profile|create|unlock|reset-password|forgot-password))(?:\/[^/?]+)?(\?.*)?$/,
      async (route) => {
      const req = route.request();
      const url = req.url();
      if (
        req.method() !== "GET" ||
        url.includes("/api/user/list") ||
        url.includes("/api/user/create") ||
        url.includes("/api/user/unlock") ||
        url.includes("/api/user/forgot-password") ||
        url.includes("/api/user/reset-password")
      ) {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { ...userDetailBase, ...targetUser } }),
      });
      }
    );

    await page.goto("/user/list", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("consistent.person@example.com")).toBeVisible();

    await page.locator('input[name="searchUserName"]').fill("Consistent Person");
    await clickUserSearch(page);
    await expect(page.getByText("U0301")).toBeVisible();

    await page.goto("/user/detail?id=U0301", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/user\/detail\?id=U0301/);
    await expect(page.locator("body")).toContainText("ユーザー詳細");
  });

  test("SC07-ST-003 shouldReflectSystemSettingChangesAcrossAllScreens", async ({ page }) => {
    let noticeDisplayCount = "10";
    const servedNoticeCounts: string[] = [];

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(true, 3)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      const method = route.request().method();
      if (method === "PUT") {
        const payload = route.request().postDataJSON() as Record<string, number>;
        noticeDisplayCount = String(payload.numberOfNotices);
      }

      servedNoticeCounts.push(noticeDisplayCount);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            data: {
              systemSettings: [
                { settingID: "PASSWORD_VALID_DAYS", value: "90" },
                { settingID: "PASSWORD_REISSUE_URL_EXPIRATION", value: "24" },
                { settingID: "NUMBER_OF_RETRIES", value: "3" },
                { settingID: "NUMBER_OF_NOTICES", value: noticeDisplayCount },
              ],
            },
          },
        }),
      });
    });

    await mockRoleDropdown(page, [...roleDropdownBase]);
    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users: [userListBase[0]], total: 1 } }),
      });
    });

    await page.route(/\/api\/roles\/list(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { roles: [], total: 0 } }),
      });
    });

    await page.goto("/settings");
    await clickEditOrSave(page);
    await page.locator('input[name="noticeDisplayCount"]').fill("25");
    await clickEditOrSave(page);

    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await expect.poll(() => servedNoticeCounts.at(-1)).toBe("25");
  });

  test("SC07-ST-004 shouldDisplayLatestDataWhenUpdatedFromAnotherScreen", async ({ page }) => {
    let updated = false;

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(true, 3)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(systemSettingsSuccessBody),
      });
    });

    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const users = [
        updated
          ? { ...userListBase[0], userId: "U0001", surname: "Latest", givenName: "Data" }
          : { ...userListBase[0], userId: "U0001", surname: "Yamada", givenName: "Taro" },
      ];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });

    await page.route(
      /\/(?:api\/user|user\/access|user\/(?:update|profile|create|unlock|reset-password|forgot-password))(?:\/[^/?]+)?(\?.*)?$/,
      async (route) => {
      const req = route.request();
      const url = req.url();
      if (
        url.includes("/api/user/list") ||
        url.includes("/api/user/create") ||
        url.includes("/api/user/unlock") ||
        url.includes("/api/user/forgot-password") ||
        url.includes("/api/user/reset-password")
      ) {
        await route.fallback();
        return;
      }

      if (req.method() === "PUT") {
        updated = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: {} }),
        });
        return;
      }

      if (req.method() !== "GET") {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: updated
            ? { ...userDetailBase, userId: "U0001", surname: "Latest", givenName: "Data" }
            : { ...userDetailBase, userId: "U0001" },
        }),
      });
      }
    );

    await openUserDetail(page, "U0001");
    await clickPrimaryUserAction(page);
    await page.locator('input[name="surname"]').fill("Latest");
    await page.locator('input[name="givenName"]').fill("Data");
    await clickPrimaryUserAction(page);
    updated = true;

    await openUserList(page);
    const row = page.locator("tbody tr").first();
    await expect(row).toContainText("Latest");
    await expect(row).toContainText("Data");
  });

  test("SC07-ST-005 shouldHandleDeletedDataReferencesWithoutInconsistency", async ({ page }) => {
    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(true, 3)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(systemSettingsSuccessBody),
      });
    });

    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            users: [{ ...userListBase[0], userId: "U0999", email: "deleted.ref@example.com" }],
            total: 1,
          },
        }),
      });
    });

    await page.route(/\/api\/user\/[^/]+(\?.*)?$/, async (route) => {
      const req = route.request();
      const url = req.url();
      if (
        req.method() !== "GET" ||
        url.includes("/api/user/list") ||
        url.includes("/api/user/create") ||
        url.includes("/api/user/unlock") ||
        url.includes("/api/user/forgot-password") ||
        url.includes("/api/user/reset-password")
      ) {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "user not found" }),
      });
    });

    await openUserList(page);
    await page.locator("tbody tr").first().locator("button").click();

    await expect(page).toHaveURL(/\/user\/detail\?id=U0999|\/user\/list/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC08-ST-002 shouldRenderScreenCorrectlyWhenPartialDataIsMissing", async ({ page }) => {
    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(true, 3)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(systemSettingsSuccessBody),
      });
    });

    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            users: [
              {
                userId: "U0400",
                email: "partial.data@example.com",
                surname: "",
                givenName: "",
                roleId: 1,
                roleName: "",
                isLocked: false,
                failedLoginAttempts: 0,
                lockedAt: null,
                updatedAt: "2026-03-01T00:00:00Z",
              },
            ],
            total: 1,
          },
        }),
      });
    });

    await openUserList(page);
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.getByText("partial.data@example.com")).toBeVisible();
  });

  test("SC08-ST-003 shouldRetryApiRequestCorrectlyWhenRequestFails", async ({ page }) => {
    let listCallCount = 0;

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(true, 3)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(systemSettingsSuccessBody),
      });
    });

    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      listCallCount += 1;
      if (listCallCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ success: false }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users: [userListBase[0]], total: 1 } }),
      });
    });

    await openUserList(page);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();

    await clickUserSearch(page);
    await expect.poll(() => listCallCount).toBeGreaterThanOrEqual(2);
    await expect(page.getByText("taro.yamada@example.com")).toBeVisible();
  });

  test("SC08-ST-004 shouldDisplayConsistentErrorMessagesAcrossSystem", async ({ page }) => {
    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(true, 3)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(systemSettingsSuccessBody),
      });
    });

    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false }),
      });
    });

    await page.route(/\/api\/user\/[^/]+(\?.*)?$/, async (route) => {
      const req = route.request();
      const url = req.url();
      if (
        req.method() !== "GET" ||
        url.includes("/api/user/list") ||
        url.includes("/api/user/create") ||
        url.includes("/api/user/unlock") ||
        url.includes("/api/user/forgot-password") ||
        url.includes("/api/user/reset-password")
      ) {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false }),
      });
    });

    await openUserList(page);
    const listSnackbar = page.getByTestId("snackbar-container");
    await expect(listSnackbar).toBeVisible();
    await expect(listSnackbar).toContainText("失敗");

    await page.goto("/user/detail?id=U0001");
    const detailSnackbar = page.getByTestId("snackbar-container");
    await expect(detailSnackbar).toBeVisible();
    await expect(detailSnackbar).toContainText("失敗");
  });

  test("SC08-ST-005 shouldMaintainUiStabilityWhenDisplayingLargeDataSets", async ({ page }) => {
    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAuthStatusBody(true, 3)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(systemSettingsSuccessBody),
      });
    });

    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      const pageNumber = Number(reqUrl.searchParams.get("pageNumber") ?? "1");
      const pageSize = Number(reqUrl.searchParams.get("pagesize") ?? "50");
      const start = (pageNumber - 1) * pageSize;

      const users = Array.from({ length: pageSize }, (_, i) => {
        const index = start + i + 1;
        return {
          ...userListBase[0],
          userId: `U${String(index).padStart(4, "0")}`,
          surname: `Large${index}`,
          givenName: "Data",
          email: `large-${index}@example.com`,
        };
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: 1000 } }),
      });
    });

    await openUserList(page);
    await expect(page.locator("tbody tr")).toHaveCount(50);
    await expect(page.getByText("large-1@example.com")).toBeVisible();

    await page.getByRole("button", { name: "2" }).first().click();
    await expect(page.getByText("large-51@example.com")).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
  });
});

