import { expect, test } from "@playwright/test";
import {
  clickDeleteRoleAction,
  clickPrimaryRoleAction,
  clickRoleSearch,
  mockAuthenticatedRole,
  mockRoleDelete,
  openRoleDetail,
  openRoleList,
  roleDetailBase,
  roleListBase,
} from "./role.helpers";

const roleEditPermissions = {
  USER: 2,
  ROLE: 3,
  NOTICE: 2,
  MANUAL: 2,
  SYSTEM_SETTINGS: 2,
};

test.describe("SC03 Role IT", () => {
  test("SC03-IT-032 shouldPreserveRoleListStateAfterReturningFromDetailScreen", async ({ page }) => {
    await mockAuthenticatedRole(page, roleEditPermissions);

    await page.route(/\/api\/roles\/list(\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      const name = url.searchParams.get("name") ?? "";
      const pageNumber = Number(url.searchParams.get("pageNumber") ?? "1");
      const pageSize = Number(url.searchParams.get("pagesize") ?? "50");

      const allRoles = Array.from({ length: 55 }, (_, i) => ({
        roleId: i + 1,
        roleName: `ROLE_${String(i + 1).padStart(3, "0")}`,
        description: `Role ${i + 1}`,
        updatedAt: "2026-02-15T10:00:00Z",
      }));

      const filtered = name
        ? allRoles.filter((role) => role.roleName.includes(name))
        : allRoles;
      const start = (pageNumber - 1) * pageSize;
      const roles = filtered.slice(start, start + pageSize);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { roles, total: filtered.length } }),
      });
    });

    await page.route(/\/api\/roles\/\d+(\?.*)?$/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: roleDetailBase }),
      });
    });

    await openRoleList(page);
    await page.locator('input[name="searchName"]').fill("ROLE_");
    await clickRoleSearch(page);

    await page.getByRole("button", { name: "2" }).first().click();
    await page.locator("thead th").nth(2).click();

    await page.locator("tbody tr").first().locator("button").click();
    await expect(page).toHaveURL(/\/role\/detail\?id=/);

    await page.goBack();
    await expect(page).toHaveURL(/\/role\/list/);
    await expect(page.locator('input[name="searchName"]')).toHaveValue("ROLE_");
    await expect(page.locator("tbody tr")).toHaveCount(5);
  });

  test("SC03-IT-033 shouldReflectRoleNameChangesAcrossSystem", async ({ page }) => {
    let updated = false;

    await mockAuthenticatedRole(page, roleEditPermissions);

    await page.route(/\/api\/roles\/list(\?.*)?$/, async (route) => {
      const list = updated
        ? [{ ...roleListBase[0], roleName: "ROLE_RENAMED_SYSTEM" }, roleListBase[1]]
        : [...roleListBase];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { roles: list, total: list.length } }),
      });
    });

    await page.route(/\/api\/roles\/\d+(\?.*)?$/, async (route) => {
      const req = route.request();
      if (req.method() === "PUT" && !/\/delete(\?.*)?$/.test(req.url())) {
        updated = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: {} }),
        });
        return;
      }

      if (req.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: updated ? { ...roleDetailBase, roleName: "ROLE_RENAMED_SYSTEM" } : roleDetailBase,
          }),
        });
        return;
      }

      await route.fallback();
    });

    await openRoleDetail(page, 2);
    await clickPrimaryRoleAction(page);
    await page.locator('input[name="roleName"]').fill("ROLE_RENAMED_SYSTEM");
    await clickPrimaryRoleAction(page);
    updated = true;

    await openRoleList(page);
    await expect(page.getByText("ROLE_RENAMED_SYSTEM")).toBeVisible();
  });

  test("SC03-IT-034 shouldPreventDeletionWhenRoleIsReferenced", async ({ page }) => {
    await mockAuthenticatedRole(page, roleEditPermissions);

    await page.route(/\/api\/roles\/\d+(\?.*)?$/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: roleDetailBase }),
      });
    });

    await mockRoleDelete(page, 400, { message: "users use this role" });

    await openRoleDetail(page, 2);
    await clickDeleteRoleAction(page);

    const deleteReasonInput = page.locator('textarea[name="deleteReasonInput"]');
    await expect(deleteReasonInput).toBeVisible();
    await deleteReasonInput.fill("still referenced");

    const modal = page.locator("div.MuiModal-root").filter({ has: deleteReasonInput }).first();
    await expect(modal).toBeVisible();
    await modal.locator("button.MuiButton-colorError").click({ force: true });

    await expect(page).toHaveURL(/\/role\/detail\?id=2/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC03-IT-035 shouldAllowRoleDeletionAfterReferencesAreRemoved", async ({ page }) => {
    let deleteCalls = 0;

    await mockAuthenticatedRole(page, roleEditPermissions);

    await page.route(/\/api\/roles\/\d+(\?.*)?$/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: roleDetailBase }),
      });
    });

    await page.route(/\/api\/roles\/\d+\/delete(\?.*)?$/, async (route) => {
      deleteCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await openRoleDetail(page, 2);
    await expect(page.locator('input[name="roleName"]')).toHaveValue("ROLE_EDIT");
    const deleteReasonInput = page.locator('textarea[name="deleteReasonInput"]');
    if (await deleteReasonInput.isVisible()) {
      await page.keyboard.press("Escape");
    }
    await clickDeleteRoleAction(page);

    await expect(deleteReasonInput).toBeVisible();
    await deleteReasonInput.fill("references removed");

    const modal = page.locator("div.MuiModal-root").filter({ has: deleteReasonInput }).first();
    await expect(modal).toBeVisible();
    await modal.locator("button.MuiButton-colorError").click({ force: true });

    await expect.poll(() => deleteCalls, { timeout: 20000 }).toBeGreaterThan(0);
    await expect(page).toHaveURL(/\/role\/list/);
  });

  test("SC03-IT-036 shouldReflectUpdatedRoleDataAfterPageRefresh", async ({ page }) => {
    let updated = false;
    let detailCalls = 0;

    await mockAuthenticatedRole(page, roleEditPermissions);

    await page.route(/\/api\/roles\/\d+(\?.*)?$/, async (route) => {
      const req = route.request();
      if (req.method() === "PUT" && !/\/delete(\?.*)?$/.test(req.url())) {
        updated = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: {} }),
        });
        return;
      }

      if (req.method() === "GET") {
        detailCalls += 1;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: updated ? { ...roleDetailBase, roleName: "ROLE_REFRESHED" } : roleDetailBase,
          }),
        });
        return;
      }

      await route.fallback();
    });

    await openRoleDetail(page, 2);
    await clickPrimaryRoleAction(page);
    await page.locator('input[name="roleName"]').fill("ROLE_REFRESHED");
    await clickPrimaryRoleAction(page);
    updated = true;

    await page.reload();
    await expect(detailCalls).toBeGreaterThanOrEqual(2);
    await expect(page).toHaveURL(/\/role\/detail\?id=2/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC03-IT-049 shouldSearchRolesCorrectlyByRoleName", async ({ page }) => {
    await mockAuthenticatedRole(page, roleEditPermissions);

    await page.route(/\/api\/roles\/list(\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      const name = url.searchParams.get("name") ?? "";
      const list = [...roleListBase].filter((role) =>
        !name ? true : role.roleName.toLowerCase().includes(name.toLowerCase())
      );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { roles: list, total: list.length } }),
      });
    });

    await openRoleList(page);
    await page.locator('input[name="searchName"]').fill("ROLE_EDIT");
    await clickRoleSearch(page);

    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.getByText("ROLE_EDIT")).toBeVisible();
    await expect(page.getByText("ROLE_VIEW_ONLY")).toHaveCount(0);
  });
});

