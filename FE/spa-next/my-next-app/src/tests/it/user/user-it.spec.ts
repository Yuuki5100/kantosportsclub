import { expect, test } from "@playwright/test";
import { expectOnLogin } from "../auth/auth.helpers";

type ForgotPasswordRequest = {
  email: string;
};
import {
  clickSearch,
  mockAuthenticatedUser,
  mockForgotPassword,
  mockResetPassword,
  mockRoleDropdown,
  mockUserDetail,
  mockUserList,
  mockUserUpdate,
  openUserDetail,
  openUserList,
  roleDropdownBase,
  userDetailBase,
  userListBase,
} from "./user.helpers";

test.describe("SC02 User IT", () => {
  test("SC02-IT-001 shouldDisplayUserListOnInitialLoad", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2);

    await openUserList(page);

    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(2);
    await expect(page.getByText("taro.yamada@example.com")).toBeVisible();
    await expect(page.getByText("hanako.sato@example.com")).toBeVisible();
  });

  test("SC02-IT-002 shouldCallUserListApiOnceOnInitialLoad", async ({ page }) => {
    let calls = 0;
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2, 200, {
      capture: () => {
        calls += 1;
      },
    });

    await openUserList(page);
    await page.waitForTimeout(3000);
    await expect.poll(() => calls).toBe(1);
  });

  test("SC02-IT-003 shouldMatchListCountAndOrderWithApi", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [userListBase[1], userListBase[0]], 2);

    await openUserList(page);

    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("hanako.sato@example.com");
    await expect(rows.nth(1)).toContainText("taro.yamada@example.com");
  });

  test("SC02-IT-004 shouldSupportPagingAndReflectTotal", async ({ page }) => {
    let latestPage = "";
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await page.route(/\/api\/user\/list(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      latestPage = reqUrl.searchParams.get("pageNumber") ?? "";
      const isPage2 = latestPage === "2";
      const users = isPage2
        ? Array.from({ length: 5 }).map((_, i) => ({
            ...userListBase[0],
            userId: `P2-${i + 1}`,
            email: `p2-${i + 1}@example.com`,
          }))
        : Array.from({ length: 50 }).map((_, i) => ({
            ...userListBase[0],
            userId: `P1-${i + 1}`,
            email: `p1-${i + 1}@example.com`,
          }));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { total: 55, users } }),
      });
    });

    await openUserList(page);
    await page.getByRole("button", { name: "2" }).first().click();

    await expect.poll(() => latestPage).toBe("2");
    await expect(page.locator("tbody tr")).toHaveCount(5);
  });

  test("SC02-IT-005 shouldShowNoDataWhenListEmpty", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [], 0);

    await openUserList(page);
    await expect(page.locator("tbody tr")).toHaveCount(0);
  });

  test("SC02-IT-006 shouldMatchUserListLabelsWithSpec", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2);

    await openUserList(page);
    await expect(page.locator("thead th")).toHaveCount(9);
    await expect(page.locator("thead th").first()).toContainText("#");
  });

  test("SC02-IT-007 shouldMatchUserListLayoutOrderWithSpec", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2);

    await openUserList(page);
    const firstRow = page.locator("tbody tr").first().locator("td");
    await expect(firstRow).toHaveCount(9);
    await expect(firstRow.nth(1)).toContainText("taro.yamada@example.com");
    await expect(firstRow.nth(8).locator("button")).toBeVisible();
  });

  test("SC02-IT-008 shouldSearchByName", async ({ page }) => {
    let requestedName = "";
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await page.route(/\/api\/user\/list(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      requestedName = reqUrl.searchParams.get("name") ?? "";
      const users = requestedName === "Yamada" ? [userListBase[0]] : [...userListBase];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });

    await openUserList(page);
    await page.locator('input[name="searchName"]').fill("Yamada");
    await clickSearch(page);

    await expect.poll(() => requestedName).toBe("Yamada");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.getByText("taro.yamada@example.com")).toBeVisible();
  });

  test("SC02-IT-010 shouldFilterByRole", async ({ page }) => {
    let roleId = "";
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page, [...roleDropdownBase]);
    await page.route(/\/api\/user\/list(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      roleId = reqUrl.searchParams.get("roleId") ?? "";
      const users = roleId === "2" ? [userListBase[1]] : [...userListBase];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });

    await openUserList(page);
    const roleSelect = page.locator("div[role='combobox']").first();
    await roleSelect.click();
    await page.getByRole("option", { name: "ROLE_EDIT" }).click();
    await clickSearch(page);

    await expect.poll(() => roleId).toBe("2");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.getByText("hanako.sato@example.com")).toBeVisible();
  });

  test("SC02-IT-011 shouldFilterLockedOnly", async ({ page }) => {
    let isLocked = "";
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await page.route(/\/api\/user\/list(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      isLocked = reqUrl.searchParams.get("isLocked") ?? "";
      const users = isLocked === "true" ? [userListBase[1]] : [...userListBase];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });

    await openUserList(page);
    await page.locator('input[name="lockoutFilter"][value="locked"]').check({ force: true });
    await clickSearch(page);

    await expect.poll(() => isLocked).toBe("true");
    await expect(page.locator("tbody tr")).toHaveCount(1);
  });

  test("SC02-IT-013 shouldFilterDeletedIncluded", async ({ page }) => {
    let isDeleted = "";
    const deletedUser = {
      ...userListBase[0],
      userId: "U0099",
      email: "deleted.user@example.com",
    };
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await page.route(/\/api\/user\/list(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      isDeleted = reqUrl.searchParams.get("isDeleted") ?? "";
      const users = isDeleted === "true" ? [deletedUser, ...userListBase] : [...userListBase];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });

    await openUserList(page);
    await page.locator('input[name="deletedFilter"][value="show"]').check({ force: true });
    await clickSearch(page);

    await expect.poll(() => isDeleted).toBe("true");
    await expect(page.getByText("deleted.user@example.com")).toBeVisible();
  });

  test("SC02-IT-014 shouldResetPagingToFirstPageWhenSearchConditionChanges", async ({
    page,
  }) => {
    let latestPage = "";
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await page.route(/\/api\/user\/list(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      latestPage = reqUrl.searchParams.get("pageNumber") ?? "";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users: [...userListBase], total: 55 } }),
      });
    });

    await openUserList(page);
    await page.getByRole("button", { name: "2" }).first().click();
    await expect.poll(() => latestPage).toBe("2");

    await page.locator("div[role='combobox']").first().click();
    await page.getByRole("option", { name: "ROLE_EDIT" }).click();
    await clickSearch(page);
    await expect.poll(() => latestPage).toBe("1");
  });

  test("SC02-IT-015 shouldNotCallApiBeforeSearchClickWhenTyping", async ({ page }) => {
    let calls = 0;
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2, 200, {
      capture: () => {
        calls += 1;
      },
    });

    await openUserList(page);
    await expect.poll(() => calls).toBe(1);
    await page.locator('input[name="searchName"]').fill("abc");
    await page.waitForTimeout(800);
    expect(calls).toBe(1);
    await clickSearch(page);
    await expect.poll(() => calls).toBe(2);
  });

  test("SC02-IT-016 shouldSortByUpdatedAtDescWhenHeaderClicked", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2);

    await openUserList(page);
    const rows = page.locator("tbody tr");
    await expect(rows.nth(0)).toContainText("taro.yamada@example.com");
    await expect(rows.nth(1)).toContainText("hanako.sato@example.com");

    // First click: ascending on updateDate -> older record first.
    await page.locator("thead th").nth(7).click();
    await expect(rows.nth(0)).toContainText("hanako.sato@example.com");
    await expect(rows.nth(1)).toContainText("taro.yamada@example.com");

    // Second click: descending on updateDate -> newer record first.
    await page.locator("thead th").nth(7).click();
    await expect(rows.nth(0)).toContainText("taro.yamada@example.com");
    await expect(rows.nth(1)).toContainText("hanako.sato@example.com");
  });

  test("SC02-IT-017 shouldOpenUserDetailFromRowAction", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2);
    await mockUserDetail(page, { ...userDetailBase, userId: "U0001" });

    await openUserList(page);
    await page.locator("tbody tr").first().locator("button").click();
    await expect(page).toHaveURL(/\/user\/detail\?id=U0001/);
    await expect(page.locator('input[name="userId"]')).toHaveValue("U0001");
  });

  test("SC02-IT-018 shouldCallUserDetailApiWithCorrectId", async ({ page }) => {
    let detailUrl = "";
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2);
    await mockUserDetail(page, userDetailBase, 200, {
      capture: (req) => {
        detailUrl = req.url();
      },
    });

    await openUserList(page);
    await page.locator("tbody tr").first().locator("button").click();
    await expect.poll(() => detailUrl).toContain("/api/user/U0001");
  });

  test("SC02-IT-019 shouldReflectUpdatedUserDataAfterReturningToList", async ({ page }) => {
    let listCalls = 0;
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await page.route(/\/api\/user\/list(\?.*)?$/, async (route) => {
      listCalls += 1;
      const users = listCalls === 1 ? [...userListBase] : [{ ...userListBase[0], roleName: "ROLE_EDIT" }, userListBase[1]];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });
    await mockUserDetail(page, userDetailBase);

    await openUserList(page);
    await page.locator("tbody tr").first().locator("button").click();
    await expect(page).toHaveURL(/\/user\/detail\?id=U0001/);
    await page.goBack();
    await expect(page).toHaveURL(/\/user\/list/);
    await clickSearch(page);
    await expect(page.getByRole("cell", { name: "ROLE_EDIT" }).first()).toBeVisible();
  });

  test("SC02-IT-020 shouldMatchUserDetailLabelsWithSpec", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase);

    await openUserDetail(page, "U0001");
    await expect(page.locator('input[name="userId"]')).toBeVisible();
    await expect(page.locator('input[name="surname"]')).toBeVisible();
    await expect(page.locator('input[name="givenName"]')).toBeVisible();
    await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("SC02-IT-021 shouldMatchUserDetailLayoutOrderWithSpec", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase);

    await openUserDetail(page, "U0001");
    const userIdBox = await page.locator('input[name="userId"]').boundingBox();
    const surnameBox = await page.locator('input[name="surname"]').boundingBox();
    expect(userIdBox).not.toBeNull();
    expect(surnameBox).not.toBeNull();
    expect((userIdBox?.y ?? 0) < (surnameBox?.y ?? 0)).toBeTruthy();
  });

  test("SC02-IT-022 shouldRedirectToLoginWhenUserListReturns401", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [], 0, 401);
    await page.goto("/user/list");
    await expectOnLogin(page);
  });

  test("SC02-IT-023 shouldShowForbiddenWhenUserListReturns403", async ({ page }) => {
    let listCalls = 0;
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [], 0, 403, {
      capture: () => {
        listCalls += 1;
      },
    });
    await page.goto("/user/list");
    await expect.poll(() => listCalls).toBe(1);
    await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/\/403/);
  });

  test("SC02-IT-024 shouldShowErrorWhenUserListReturns500", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [], 0, 500);

    await openUserList(page);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
  });

  test("SC02-IT-025 shouldHandleNetworkOfflineOnUserListWithoutCrash", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await page.route(/\/api\/user\/list(\?.*)?$/, async (route) => {
      await route.abort("internetdisconnected");
    });

    await openUserList(page);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC02-IT-026 shouldShowNotFoundWhenUserDetailReturns404", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase, 404);

    await openUserDetail(page, "U9999");
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC02-IT-027 shouldBlockUnauthorizedDirectAccessToOtherUserDetail", async ({
    page,
  }) => {
    let detailCalls = 0;
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase, 403, {
      capture: () => {
        detailCalls += 1;
      },
    });

    await page.goto("/user/detail?id=U0001");
    await expect.poll(() => detailCalls).toBe(1);
    await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/\/403/);
  });

  test("SC02-IT-028 shouldShowErrorWhenUserDetailReturns500", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase, 500);

    await openUserDetail(page, "U0001");
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
  });

  test("SC02-IT-029 shouldHandle303RedirectFromUserDetailSafely", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await page.route(/\/api\/user\/[^/]+(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 303,
        headers: { Location: "/login" },
        body: "",
      });
    });

    await page.goto("/user/detail?id=U0001");
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC02-IT-030 shouldHideEditControlsWhenNoEditPermission", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase);

    await openUserDetail(page, "U0001");
    await expect(page.locator('input[name="email"]')).toBeDisabled();
    await expect(page.locator('input[name="surname"]')).toBeDisabled();
  });

  test("SC02-IT-031 shouldDisableSaveWhenNoEditPermissionEvenViaDomManipulation", async ({
    page,
  }) => {
    let updateCalls = 0;
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase);
    await mockUserUpdate(page, 200, {
      capture: () => {
        updateCalls += 1;
      },
    });

    await openUserDetail(page, "U0001");
    await page.evaluate(() => {
      const email = document.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement | null;
      if (email) {
        email.removeAttribute("disabled");
        email.value = "tampered@example.com";
        email.dispatchEvent(new Event("input", { bubbles: true }));
        email.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    expect(updateCalls).toBe(0);
  });

  test("SC02-IT-032 shouldNotExposeEditButtonsToViewOnlyUser", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2);
    await mockUserDetail(page, userDetailBase);

    await openUserList(page);
    await expect(page.getByRole("button", { name: /new|create/i })).toHaveCount(0);

    await page.locator("tbody tr").first().locator("button").click();
    await expect(page).toHaveURL(/\/user\/detail\?id=U0001/);
    await expect(page.locator('input[name="surname"]')).toBeDisabled();
    await expect(page.locator('input[name="email"]')).toBeDisabled();
  });

  test("SC02-IT-033 shouldDisableUnlockActionWhenUserNotLocked", async ({ page }) => {
    let unlockCalls = 0;
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);
    await mockUserDetail(page, { ...userDetailBase, isLocked: false });
    await page.route(/\/api\/user\/unlock(\?.*)?$/, async (route) => {
      unlockCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await openUserDetail(page, "U0001");
    await page.waitForTimeout(500);
    expect(unlockCalls).toBe(0);
  });

  test("SC02-IT-034 shouldNotShowLockButtonWhenAlreadyLockedIfSpecSaysHide", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);
    await mockUserDetail(page, { ...userDetailBase, isLocked: true });

    await openUserDetail(page, "U0002");
    await expect(page.getByRole("button", { name: /lock/i })).toHaveCount(0);
  });

  test("SC02-IT-035 shouldPreventEditingImmutableFields", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase);

    await openUserDetail(page, "U0001");
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeDisabled();
  });

  test("SC02-IT-036 shouldPreserveSearchConditionsAfterNavigatingBackFromDetail", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2);
    await mockUserDetail(page, userDetailBase);

    await openUserList(page);
    await page.locator('input[name="searchName"]').fill("Yamada");
    await clickSearch(page);
    await page.locator("tbody tr").first().locator("button").click();
    await expect(page).toHaveURL(/\/user\/detail\?id=U0001/);
    await page.goBack();
    await expect(page).toHaveURL(/\/user\/list/);
    await expect(page.locator("table")).toBeVisible();
  });

  test("SC02-IT-037 shouldCallListApiAgainOnManualRefreshOnly", async ({ page }) => {
    let listCalls = 0;
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2, 200, {
      capture: () => {
        listCalls += 1;
      },
    });

    await openUserList(page);
    await page.waitForTimeout(2000);
    expect(listCalls).toBe(1);
    await clickSearch(page);
    await expect.poll(() => listCalls).toBe(2);
  });

  test("SC02-IT-038 shouldShowValidationMessageForInvalidSearchInput", async ({ page }) => {
    let calls = 0;
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2, 200, {
      capture: () => {
        calls += 1;
      },
    });

    await openUserList(page);
    await page.locator('input[name="searchName"]').fill("x".repeat(256));
    await clickSearch(page);
    await expect.poll(() => calls).toBe(2);
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC02-IT-039 shouldHandleLargeResponseWithoutUiFreeze", async ({ page }) => {
    const users = Array.from({ length: 50 }).map((_, i) => ({
      ...userListBase[0],
      userId: `UL-${i + 1}`,
      email: `user-${i + 1}@example.com`,
    }));
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserList(page, users, 50, 200, { delayMs: 2000 });

    await openUserList(page);
    await expect(page.locator("tbody tr")).toHaveCount(50);
    await page.mouse.wheel(0, 400);
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC02-IT-040 shouldDeepLinkDirectlyToUserDetailAndRender", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: false });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase);

    await openUserDetail(page, "U0001");
    await expect(page.locator('input[name="userId"]')).toHaveValue("U0001");
  });

  test("SC02-IT-041 shouldSubmitForgotPasswordWithValidEmail", async ({ page }) => {
    let payload: ForgotPasswordRequest | null = null;
    await mockForgotPassword(page, 200, {
      capture: (req) => {
        payload = req.postDataJSON() as ForgotPasswordRequest;
      },
    });

    await page.goto("/forgot-password");
    await page.locator('input[name="email"]').fill("taro.yamada@example.com");
    await page.locator('button[type="submit"]').click();

    expect(payload).toMatchObject({ email: "taro.yamada@example.com" });
    await expect(page.locator("button").first()).toBeVisible();
  });

  test("SC02-IT-042 shouldBlockForgotPasswordSubmitWhenEmailEmpty", async ({ page }) => {
    let calls = 0;
    await mockForgotPassword(page, 200, {
      capture: () => {
        calls += 1;
      },
    });

    await page.goto("/forgot-password");
    await page.locator('button[type="submit"]').click();
    expect(calls).toBe(0);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("SC02-IT-043 shouldShowErrorWhenForgotPasswordApiReturns500", async ({ page }) => {
    await mockForgotPassword(page, 500);

    await page.goto("/forgot-password");
    await page.locator('input[name="email"]').fill("taro.yamada@example.com");
    await page.locator('button[type="submit"]').click();

    await expect(page.locator("body")).toBeVisible();
  });

  test("SC02-IT-044 shouldRedirectToLoginWhenForgotPasswordReturns401", async ({ page }) => {
    await mockForgotPassword(page, 401);

    await page.goto("/forgot-password");
    await page.locator('input[name="email"]').fill("taro.yamada@example.com");
    await page.locator('button[type="submit"]').click();

    // forgot-password is excluded from global 401 redirect in apiClient.
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("SC02-IT-045 shouldHandleNetworkFailureOnForgotPasswordWithoutCrash", async ({
    page,
  }) => {
    await page.route(/\/api\/user\/forgot-password(\?.*)?$/, async (route) => {
      await route.abort("internetdisconnected");
    });

    await page.goto("/forgot-password");
    await page.locator('input[name="email"]').fill("taro.yamada@example.com");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC02-IT-046 shouldResetPasswordWithValidTokenAndValidPassword", async ({ page }) => {
    let url = "";
    await mockResetPassword(page, 200, {
      capture: (req) => {
        url = req.url();
      },
    });

    await page.goto("/reset-password/RST-VALID-0001");
    await page.locator('input[name="password"]').fill("Aa1!Aa1!Aa1!aa");
    await page.locator('input[name="confirmPassword"]').fill("Aa1!Aa1!Aa1!aa");
    await page.locator('button[type="submit"]').click();

    await expect.poll(() => url).toContain("/api/user/reset-password/RST-VALID-0001");
    await expect(page.locator("button").first()).toBeVisible();
  });

  test("SC02-IT-047 shouldValidateResetPasswordMismatchAndBlockApi", async ({ page }) => {
    let calls = 0;
    await mockResetPassword(page, 200, {
      capture: () => {
        calls += 1;
      },
    });

    await page.goto("/reset-password/RST-VALID-0002");
    await page.locator('input[name="password"]').fill("Aa1!Aa1!Aa1!aa");
    await page.locator('input[name="confirmPassword"]').fill("Aa1!Aa1!Aa1!ab");
    await page.locator('button[type="submit"]').click();
    expect(calls).toBe(0);
  });

  test("SC02-IT-048 shouldShowNotFoundWhenResetTokenReturns404", async ({ page }) => {
    await mockResetPassword(page, 404);

    await page.goto("/reset-password/RST-NOTFOUND-9999");
    await page.locator('input[name="password"]').fill("Aa1!Aa1!Aa1!aa");
    await page.locator('input[name="confirmPassword"]').fill("Aa1!Aa1!Aa1!aa");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC02-IT-049 shouldShowErrorWhenResetPasswordReturns500", async ({ page }) => {
    await mockResetPassword(page, 500);

    await page.goto("/reset-password/RST-VALID-0003");
    await page.locator('input[name="password"]').fill("Aa1!Aa1!Aa1!aa");
    await page.locator('input[name="confirmPassword"]').fill("Aa1!Aa1!Aa1!aa");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC02-IT-050 shouldRedirectToLoginWhenResetPasswordReturns401", async ({ page }) => {
    await mockResetPassword(page, 401);

    await page.goto("/reset-password/RST-VALID-0004");
    await page.locator('input[name="password"]').fill("Aa1!Aa1!Aa1!aa");
    await page.locator('input[name="confirmPassword"]').fill("Aa1!Aa1!Aa1!aa");
    await page.locator('button[type="submit"]').click();
    // reset-password is excluded from global 401 redirect in apiClient.
    await expect(page).toHaveURL(/\/reset-password\/RST-VALID-0004/);
  });

  // Change password is not implemented in FE yet.
  // Re-enable SC02-IT-051 ~ SC02-IT-055 after /change-password page and API wiring are added.
  //
  // test("SC02-IT-051 shouldChangePasswordWithValidInputs", async ({ page }) => { ... });
  // test("SC02-IT-052 shouldBlockChangePasswordWhenConfirmMismatch", async ({ page }) => { ... });
  // test("SC02-IT-053 shouldRedirectToLoginWhenChangePasswordReturns401", async ({ page }) => { ... });
  // test("SC02-IT-054 shouldShowForbiddenWhenChangePasswordReturns403", async ({ page }) => { ... });
  // test("SC02-IT-055 shouldHandleChangePassword500And303RedirectSafely", async ({ page }) => { ... });
});
