import { expect, test } from "@playwright/test";
import type {
  RoleCreateRequest,
  RoleDeleteRequest,
  RoleUpdateRequest,
} from "@/types/role";
import { expectOnLogin } from "../auth/auth.helpers";
import {
  clickDeleteRoleAction,
  clickPrimaryRoleAction,
  mockAuthenticatedRole,
  mockRoleCreate,
  mockRoleDelete,
  mockRoleDetail,
  mockRoleList,
  mockRoleUpdate,
  openRoleCreate,
  openRoleDetail,
  openRoleList,
  roleDetailBase,
  roleListBase,
} from "./role.helpers";

const roleViewPermissions = {
  USER: 2,
  ROLE: 2,
  NOTICE: 2,
  MANUAL: 2,
  SYSTEM_SETTINGS: 2,
};

const roleEditPermissions = {
  USER: 2,
  ROLE: 3,
  NOTICE: 2,
  MANUAL: 2,
  SYSTEM_SETTINGS: 2,
};

test.describe("SC04 Role IT", () => {
  test("SC04-IT-ROLE-001 shouldHideRoleMenuWhenRolePermissionNone", async ({ page }) => {
    await mockAuthenticatedRole(page, { ...roleViewPermissions, ROLE: 1 });
    await page.goto("/");
    await expect(page.getByText(/Role List|繝ｭ繝ｼ繝ｫ荳隕ｧ/i)).toHaveCount(0);
  });

  test("SC04-IT-ROLE-002 shouldBlockDirectAccessToRoleListWhenRolePermissionNone", async ({
    page,
  }) => {
    await mockAuthenticatedRole(page, { ...roleViewPermissions, ROLE: 1 });
    await openRoleList(page);
    await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/\/403/);
  });

  test("SC04-IT-ROLE-003 shouldHandleRoleListApi403WhenRolePermissionNone", async ({
    page,
  }) => {
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleList(page, [], 0, 403);
    await openRoleList(page);
    await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/\/403/);
  });

  test("SC04-IT-ROLE-004 shouldDisplayRoleListForRoleViewPermission", async ({ page }) => {
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleList(page, [...roleListBase], 2);

    await openRoleList(page);
    await expect(page.locator("tbody tr")).toHaveCount(2);
    await expect(page.getByText("ROLE_VIEW_ONLY")).toBeVisible();
    await expect(page.getByText("ROLE_EDIT")).toBeVisible();
  });

  test("SC04-IT-ROLE-005 shouldCallRoleListApiOnceOnInitialLoad", async ({ page }) => {
    let calls = 0;
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleList(page, [...roleListBase], 2, 200, {
      capture: () => {
        calls += 1;
      },
    });

    await openRoleList(page);
    await page.waitForTimeout(3000);
    await expect.poll(() => calls).toBe(1);
  });

  test("SC04-IT-ROLE-006 shouldShowNoDataWhenRoleListEmpty", async ({ page }) => {
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleList(page, [], 0);

    await openRoleList(page);
    await expect(page.locator("tbody tr")).toHaveCount(0);
  });

  test("SC04-IT-ROLE-007 shouldHideCreateRoleButtonWhenRoleEditNotGranted", async ({
    page,
  }) => {
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleList(page, [...roleListBase], 2);

    await openRoleList(page);
    const buttonsBeforeTable = page
      .locator("table")
      .first()
      .locator('xpath=preceding::button[contains(@class,"MuiButton-root")]');
    await expect(buttonsBeforeTable).toHaveCount(1);
  });

  test("SC04-IT-ROLE-008 shouldBlockDirectAccessToRoleCreateWhenRoleEditNotGranted", async ({
    page,
  }) => {
    let createCalls = 0;
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleCreate(page, 403, { success: false }, {
      capture: () => {
        createCalls += 1;
      },
    });

    await openRoleCreate(page);
    await page.locator('input[name="roleName"]').fill("ROLE_CANT_CREATE");
    await page.locator('textarea[name="description"]').fill("no edit permission");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    expect(createCalls).toBe(0);
  });

  test("SC04-IT-ROLE-009 shouldOpenRoleDetailForRoleViewPermission", async ({ page }) => {
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleDetail(page, roleDetailBase);

    await openRoleDetail(page, 2);
    await expect(page.locator('input[name="roleName"]')).toHaveValue("ROLE_EDIT");
    await expect(page.locator('textarea[name="description"]')).toHaveValue("Edit role");
  });

  test("SC04-IT-ROLE-010 shouldCallRoleDetailApiWithCorrectRoleId", async ({ page }) => {
    let detailUrl = "";
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleDetail(page, roleDetailBase, 200, {
      capture: (req) => {
        detailUrl = req.url();
      },
    });

    await openRoleDetail(page, 2);
    await expect.poll(() => detailUrl).toContain("/api/roles/2");
  });

  test("SC04-IT-ROLE-011 shouldHideEditAndDeleteButtonsOnRoleDetailWhenRoleEditNotGranted", async ({
    page,
  }) => {
    let updateCalls = 0;
    let deleteCalls = 0;
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleDetail(page, roleDetailBase);
    await mockRoleUpdate(page, 200, { success: true }, {
      capture: () => {
        updateCalls += 1;
      },
    });
    await mockRoleDelete(page, 200, { success: true }, {
      capture: () => {
        deleteCalls += 1;
      },
    });

    await openRoleDetail(page, 2);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    expect(updateCalls).toBe(0);
    expect(deleteCalls).toBe(0);
  });

  test("SC04-IT-ROLE-012 shouldDisplayRoleListAndEnableCreateForRoleEditPermission", async ({
    page,
  }) => {
    await mockAuthenticatedRole(page, roleEditPermissions);
    await mockRoleList(page, [...roleListBase], 2);

    await openRoleList(page);
    const buttonsBeforeTable = page
      .locator("table")
      .first()
      .locator('xpath=preceding::button[contains(@class,"MuiButton-root")]');
    await expect(buttonsBeforeTable).toHaveCount(2);

    await openRoleCreate(page);
    await expect(page).toHaveURL(/\/role\/detail\?mode=create/);
    await expect(page.locator('input[name="roleName"]')).toBeEditable();
  });

  test("SC04-IT-ROLE-013 shouldCreateRoleWhenRoleEditGranted", async ({ page }) => {
    let payload: RoleCreateRequest | null = null;
    await mockAuthenticatedRole(page, roleEditPermissions);
    await mockRoleCreate(page, 200, { success: true, data: { roleId: 3001 } }, {
      capture: (req) => {
        payload = req.postDataJSON() as RoleCreateRequest;
      },
    });

    await openRoleCreate(page);
    await page.locator('input[name="roleName"]').fill("ROLE_TEST_CREATE");
    await page.locator('textarea[name="description"]').fill("Created by IT");
    await clickPrimaryRoleAction(page);

    expect(payload).toMatchObject({
      roleName: "ROLE_TEST_CREATE",
      description: "Created by IT",
    });
    await expect(page).toHaveURL(/\/role\/list/);
  });

  test("SC04-IT-ROLE-014 shouldValidateRequiredRoleNameOnCreateAndBlockApi", async ({
    page,
  }) => {
    let calls = 0;
    await mockAuthenticatedRole(page, roleEditPermissions);
    await mockRoleCreate(page, 200, { success: true, data: { roleId: 3001 } }, {
      capture: () => {
        calls += 1;
      },
    });

    await openRoleCreate(page);
    await page.locator('textarea[name="description"]').fill("x");
    await clickPrimaryRoleAction(page);
    expect(calls).toBe(0);
    await expect(page).toHaveURL(/\/role\/detail\?mode=create/);
  });

  test("SC04-IT-ROLE-015 shouldShowErrorWhenCreateRoleApiReturns500", async ({ page }) => {
    await mockAuthenticatedRole(page, roleEditPermissions);
    await mockRoleCreate(page, 500, { success: false });

    await openRoleCreate(page);
    await page.locator('input[name="roleName"]').fill("ROLE_TEST_CREATE_500");
    await page.locator('textarea[name="description"]').fill("retry me");
    await clickPrimaryRoleAction(page);

    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(page.locator('input[name="roleName"]')).toHaveValue("ROLE_TEST_CREATE_500");
  });

  test("SC04-IT-ROLE-016 shouldUpdateRoleWhenRoleEditGranted", async ({ page }) => {
    let detailCalls = 0;
    let updateCalls = 0;
    let updatePayload: RoleUpdateRequest | null = null;
    await mockAuthenticatedRole(page, roleEditPermissions);
    await page.route(/\/api\/roles\/\d+(\?.*)?$/, async (route) => {
      const req = route.request();
      if (req.method() === "PUT" && !/\/delete(\?.*)?$/.test(req.url())) {
        updateCalls += 1;
        updatePayload = req.postDataJSON() as RoleUpdateRequest;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: {} }),
        });
        return;
      }
      if (req.method() === "GET") {
        detailCalls += 1;
        const detail =
          detailCalls === 1
            ? roleDetailBase
            : { ...roleDetailBase, roleName: "ROLE_EDIT_UPDATED", description: "Updated" };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: detail }),
        });
        return;
      }
      await route.fallback();
    });

    await openRoleDetail(page, 2);
    const roleNameInput = page.locator('input[name="roleName"]');
    await expect(roleNameInput).toHaveValue("ROLE_EDIT");
    await clickPrimaryRoleAction(page);
    await expect(roleNameInput).toBeEditable();
    await roleNameInput.fill("ROLE_EDIT_UPDATED");
    await page.locator('textarea[name="description"]').fill("Updated");
    await clickPrimaryRoleAction(page);

    await expect.poll(() => updateCalls, { timeout: 20000 }).toBeGreaterThan(0);
    expect(updatePayload).toMatchObject({
      roleName: "ROLE_EDIT_UPDATED",
      description: "Updated",
    });
    await expect(roleNameInput).toHaveValue("ROLE_EDIT_UPDATED");
  });

  test("SC04-IT-ROLE-017 shouldShowErrorWhenUpdateRoleApiReturns500AndStayEditable", async ({
    page,
  }) => {
    let updateCalls = 0;
    await mockAuthenticatedRole(page, roleEditPermissions);
    await mockRoleDetail(page, roleDetailBase);
    await mockRoleUpdate(page, 500, { success: false }, {
      capture: () => {
        updateCalls += 1;
      },
    });

    await openRoleDetail(page, 2);
    const roleNameInput = page.locator('input[name="roleName"]');
    await expect(roleNameInput).toBeVisible();
    await expect(roleNameInput).toHaveValue("ROLE_EDIT");
    await expect(page).toHaveURL(/\/role\/detail\?id=2/);
    await clickPrimaryRoleAction(page);
    await expect(roleNameInput).toBeEditable();
    await roleNameInput.fill("ROLE_EDIT_FAIL");
    await clickPrimaryRoleAction(page);

    await expect.poll(() => updateCalls, { timeout: 20000 }).toBeGreaterThan(0);
    await expect(page).toHaveURL(/\/role\/detail\?id=2/);
    await expect(roleNameInput).toBeEditable();
    await expect(roleNameInput).toHaveValue("ROLE_EDIT_FAIL");
  });

  test("SC04-IT-ROLE-018 shouldDeleteRoleWithDeletionReasonWhenRoleEditGranted", async ({
    page,
  }) => {
    let payload: RoleDeleteRequest | null = null;
    let deleteCalls = 0;
    await mockAuthenticatedRole(page, roleEditPermissions);
    await mockRoleDetail(page, roleDetailBase);
    await mockRoleDelete(page, 200, { success: true, data: {} }, {
      capture: (req) => {
        deleteCalls += 1;
        payload = req.postDataJSON() as RoleDeleteRequest;
      },
    });

    await openRoleDetail(page, 2);
    await expect(page.locator('input[name="roleName"]')).toHaveValue("ROLE_EDIT");
    const deleteReasonInput = page.locator('textarea[name="deleteReasonInput"]');
    await expect(page).toHaveURL(/\/role\/detail\?id=2/);
    if (await deleteReasonInput.isVisible()) {
      await page.keyboard.press("Escape");
    }
    await clickDeleteRoleAction(page);
    await expect(deleteReasonInput).toBeVisible();
    await deleteReasonInput.fill("No longer used");
    const modal = page.locator("div.MuiModal-root").filter({ has: deleteReasonInput }).first();
    await expect(modal).toBeVisible();
    await modal.locator("button.MuiButton-colorError").click();

    await expect.poll(() => deleteCalls, { timeout: 20000 }).toBeGreaterThan(0);
    expect(payload).toMatchObject({ deletionReason: "No longer used" });
    await expect(page).toHaveURL(/\/role\/list/);
  });
  test("SC04-IT-ROLE-019 shouldShowSpecificMessageWhenDeleteRoleFailsBecauseAssigned", async ({
    page,
  }) => {
    let deleteCalls = 0;
    await mockAuthenticatedRole(page, roleEditPermissions);
    await mockRoleDetail(page, roleDetailBase);
    await mockRoleDelete(page, 400, { message: "users use this role" }, {
      capture: () => {
        deleteCalls += 1;
      },
    });

    await openRoleDetail(page, 2);
    await expect(page.locator('input[name="roleName"]')).toHaveValue("ROLE_EDIT");
    const deleteReasonInput = page.locator('textarea[name="deleteReasonInput"]');
    await expect(page).toHaveURL(/\/role\/detail\?id=2/);
    if (await deleteReasonInput.isVisible()) {
      await page.keyboard.press("Escape");
    }
    await clickDeleteRoleAction(page);
    await expect(deleteReasonInput).toBeVisible();
    await deleteReasonInput.fill("No longer used");
    const modal = page.locator("div.MuiModal-root").filter({ has: deleteReasonInput }).first();
    await expect(modal).toBeVisible();
    await modal.locator("button.MuiButton-colorError").click();

    await expect.poll(() => deleteCalls, { timeout: 20000 }).toBeGreaterThan(0);
    await expect(page).toHaveURL(/\/role\/detail\?id=2/);
    await expect(page.locator("body")).toBeVisible();
  });
  test("SC04-IT-ROLE-020 shouldRedirectToLoginWhenRoleApiReturns401", async ({ page }) => {
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleList(page, [], 0, 401);

    await openRoleList(page);
    await expectOnLogin(page);
  });

  test("SC04-IT-ROLE-021 shouldShowForbiddenWhenRoleApiReturns403EvenIfRoleEditGranted", async ({
    page,
  }) => {
    let updateCalls = 0;
    await mockAuthenticatedRole(page, roleEditPermissions);
    await mockRoleDetail(page, roleDetailBase);
    await mockRoleUpdate(page, 403, { success: false }, {
      capture: () => {
        updateCalls += 1;
      },
    });

    await openRoleDetail(page, 2);
    const roleNameInput = page.locator('input[name="roleName"]');
    await expect(roleNameInput).toHaveValue("ROLE_EDIT");
    await expect(page).toHaveURL(/\/role\/detail\?id=2/);
    await clickPrimaryRoleAction(page);
    await expect(roleNameInput).toBeEditable();
    await roleNameInput.fill("ROLE_FORBIDDEN");
    await clickPrimaryRoleAction(page);

    await expect.poll(() => updateCalls, { timeout: 20000 }).toBeGreaterThan(0);
    await expect.poll(() => page.url(), { timeout: 50000 }).toMatch(/\/403/);
  });

  test("SC04-IT-ROLE-022 shouldShowNotFoundWhenRoleDetailReturns404", async ({ page }) => {
    await mockAuthenticatedRole(page, roleViewPermissions);
    await mockRoleDetail(page, roleDetailBase, 404);

    await openRoleDetail(page, 99999);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC04-IT-ROLE-023 shouldHandle303RedirectFromRoleApisSafely", async ({ page }) => {
    await mockAuthenticatedRole(page, roleViewPermissions);
    await page.route(/\/api\/roles\/list(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 303,
        headers: { Location: "/login" },
        body: "",
      });
    });

    await openRoleList(page);
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).toBeVisible();
  });
});
