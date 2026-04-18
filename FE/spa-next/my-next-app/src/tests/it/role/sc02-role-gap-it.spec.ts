import { expect, test } from "@playwright/test";
import {
  clickPrimaryRoleAction,
  mockAuthenticatedRole,
  mockRoleDetail,
  mockRoleUpdate,
  openRoleDetail,
  roleDetailBase,
} from "./role.helpers";

const roleEditPermissions = {
  USER: 2,
  ROLE: 3,
  NOTICE: 2,
  MANUAL: 2,
  SYSTEM_SETTINGS: 2,
};

test.describe("SC02 Role Gap IT", () => {
  test("SC02-IT-063 shouldRetainRoleInputsWhenRoleUpdateFails", async ({ page }) => {
    await mockAuthenticatedRole(page, roleEditPermissions);
    await mockRoleDetail(page, roleDetailBase);
    let updateCalls = 0;
    await mockRoleUpdate(page, 500, { success: false }, {
      capture: () => {
        updateCalls += 1;
      },
    });

    await openRoleDetail(page, 2);
    await expect(page.locator('input[name="roleName"]')).toHaveValue("ROLE_EDIT");
    await expect(page.locator('textarea[name="description"]')).toHaveValue("Edit role");
    await clickPrimaryRoleAction(page);
    await expect(page.getByRole("button", { name: "登録" })).toBeVisible();

    await page.locator('input[name="roleName"]').fill("ROLE_KEEP_ON_FAIL");
    await page.locator('textarea[name="description"]').fill("keep role inputs on failure");
    await page.getByRole("button", { name: "登録" }).click();

    await expect.poll(() => updateCalls).toBe(1);
    await expect(page.locator('input[name="roleName"]')).toHaveValue("ROLE_KEEP_ON_FAIL");
    await expect(page.locator('textarea[name="description"]')).toHaveValue(
      "keep role inputs on failure"
    );
    await expect(page.getByRole("button", { name: "登録" })).toBeVisible();
  });
});
