import { expect, test } from "@playwright/test";
import type { Page, Route } from "@playwright/test";
import { mockRoleDropdown, mockUserList, userListBase } from "../user/user.helpers";
import {
  mockAuthenticatedRole,
  mockRoleDetail,
  mockRoleList,
  openRoleDetail,
  roleDetailBase,
  roleListBase,
} from "./role.helpers";

async function mockTopNoticeList(page: Page) {
  await page.route(/\/api\/notice\/list(\?.*)?$/, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { noticeList: [] } }),
    });
  });
}

async function mockManualList(page: Page) {
  await page.route(/\/api\/manual\/list(\?.*)?$/, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { manuals: [], total: 0 } }),
    });
  });
}

test.describe("SC04 Permission IT", () => {
  test("SC04-IT-PERM-001 shouldComputeCanViewAndCanEditFromRolePermissionsCorrectly", async ({
    page,
  }) => {
    test.slow();
    await mockAuthenticatedRole(page, {
      USER: 2,
      ROLE: 3,
      NOTICE: 1,
      MANUAL: 2,
      SYSTEM_SETTINGS: 0,
    });
    await mockRoleDropdown(page);
    await mockUserList(page, [...userListBase], 2);
    await mockRoleDetail(page, roleDetailBase);
    await mockManualList(page);
    await mockTopNoticeList(page);

    await page.goto("/user/list");
    await expect(page).toHaveURL(/\/user\/list/);

    await openRoleDetail(page, 2);
    const roleName = page.locator('input[name="roleName"]');
    await expect(roleName).toBeVisible();
    await expect(roleName).not.toBeEditable();

    await page.goto("/manual/list");
    await expect(page).toHaveURL(/\/manual\/list/);

    await page.goto("/settings");
    await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/\/403/);
  });

  test("SC04-IT-PERM-002 shouldTreatMissingRolePermissionsAsNoAccessAndAvoidCrash", async ({
    page,
  }) => {
    await mockAuthenticatedRole(page, {});
    await page.goto("/role/list");
    await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/\/403/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC04-IT-PERM-003 shouldHideUserModuleMenuWhenUserPermissionNone", async ({ page }) => {
    await mockAuthenticatedRole(page, {
      USER: 1,
      ROLE: 2,
      NOTICE: 2,
      MANUAL: 2,
      SYSTEM_SETTINGS: 2,
    });
    await mockRoleList(page, [...roleListBase], 2);

    await page.goto("/role/list");
    await expect(page).toHaveURL(/\/role\/list/);
    await page.goto("/user/list");
    await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/\/403/);
  });

  test("SC04-IT-PERM-004 shouldHideNoticeMenuWhenNoticePermissionNone", async ({ page }) => {
    await mockAuthenticatedRole(page, {
      USER: 2,
      ROLE: 2,
      NOTICE: 1,
      MANUAL: 2,
      SYSTEM_SETTINGS: 2,
    });
    await mockTopNoticeList(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
  });

  test("SC04-IT-PERM-005 shouldHideManualMenuWhenManualPermissionNone", async ({ page }) => {
    await mockAuthenticatedRole(page, {
      USER: 2,
      ROLE: 2,
      NOTICE: 2,
      MANUAL: 1,
      SYSTEM_SETTINGS: 2,
    });
    await page.goto("/manual/list");
    await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/\/403/);
  });

  test("SC04-IT-PERM-006 shouldHideSystemSettingsMenuWhenSystemSettingsPermissionNone", async ({
    page,
  }) => {
    await mockAuthenticatedRole(page, {
      USER: 2,
      ROLE: 2,
      NOTICE: 2,
      MANUAL: 2,
      SYSTEM_SETTINGS: 1,
    });
    await page.goto("/settings");
    await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/\/403/);
  });

  test("SC04-IT-PERM-007 shouldExposeEditActionsOnlyWhenPermissionLevelIsEdit", async ({
    browser,
  }) => {
    const viewPage = await browser.newPage();
    await mockAuthenticatedRole(viewPage, {
      USER: 2,
      ROLE: 2,
      NOTICE: 2,
      MANUAL: 2,
      SYSTEM_SETTINGS: 2,
    });
    await mockRoleDetail(viewPage, roleDetailBase);
    await openRoleDetail(viewPage, 2);
    const viewRoleName = viewPage.locator('input[name="roleName"]');
    await expect(viewRoleName).toBeVisible();
    await expect(viewRoleName).not.toBeEditable();
    await expect(viewPage.locator('textarea[name="deleteReasonInput"]')).toHaveCount(0);
    await viewPage.close();

    const editPage = await browser.newPage();
    await mockAuthenticatedRole(editPage, {
      USER: 2,
      ROLE: 3,
      NOTICE: 2,
      MANUAL: 2,
      SYSTEM_SETTINGS: 2,
    });
    await mockRoleDetail(editPage, roleDetailBase);
    await openRoleDetail(editPage, 2);
    const editRoleName = editPage.locator('input[name="roleName"]');
    await expect(editRoleName).toBeVisible();
    await expect(editRoleName).not.toBeEditable();
    await editRoleName.locator("xpath=preceding::button[1]").click();
    await expect(editRoleName).toBeEditable();
    await editPage.close();
  });
});
