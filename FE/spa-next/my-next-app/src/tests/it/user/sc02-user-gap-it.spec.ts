import { expect, test } from "@playwright/test";
import {
  mockAuthenticatedUser,
  mockRoleDropdown,
  mockUserDetail,
  mockUserUpdate,
  openUserDetail,
  roleDropdownBase,
  userDetailBase,
  userListBase,
} from "./user.helpers";

async function mockUserCreate(
  page: any,
  status = 200,
  options?: { capture?: (req: any) => void }
) {
  await page.route(/\/api\/user\/create(\?.*)?$/, async (route: any) => {
    const req = route.request();
    if (req.method() !== "POST") {
      await route.fallback();
      return;
    }
    options?.capture?.(req);
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: {} }),
    });
  });
}

async function openUserCreate(page: any) {
  await page.goto("/user/detail?mode=create");
  await expect(page).toHaveURL(/\/user\/detail\?mode=create/);
  await expect(page.locator('input[name="userId"]')).toBeVisible();
}

test.describe("SC02 User Gap IT", () => {
  test("SC02-IT-051 shouldCreateUserWhenInputsAreValid", async ({ page }) => {
    let createPayload: any = null;
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);
    await page.route(/\/api\/user\/list(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users: [...userListBase], total: 2 } }),
      });
    });
    await mockUserCreate(page, 200, {
      capture: (req) => {
        createPayload = req.postDataJSON();
      },
    });

    await openUserCreate(page);
    await page.locator('input[name="userId"]').fill("U1000");
    await page.locator('input[name="surname"]').fill("CreateSurname");
    await page.locator('input[name="givenName"]').fill("CreateGiven");
    await page.locator('input[name="phoneNumber"]').fill("09012341234");
    await page.locator('input[name="email"]').fill("create.user@example.com");
    await page.locator("div[role='combobox']").first().click();
    await page.getByRole("option", { name: "ROLE_EDIT" }).click();
    await page.getByRole("button", { name: "登録" }).click();

    expect(createPayload).toMatchObject({
      userId: "U1000",
      surname: "CreateSurname",
      givenName: "CreateGiven",
      phoneNo: "09012341234",
      email: "create.user@example.com",
      roleId: 2,
    });
    await expect(page).toHaveURL(/\/admin\/user\/list/);
    await expect(page.locator("table")).toBeVisible();
  });

  test("SC02-IT-052 shouldBlockCreateUserApiWhenRequiredFieldsAreMissing", async ({ page }) => {
    let createCalls = 0;
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);
    await mockUserCreate(page, 200, {
      capture: () => {
        createCalls += 1;
      },
    });

    await openUserCreate(page);
    await page.getByRole("button", { name: "登録" }).click();

    expect(createCalls).toBe(0);
    await expect(page.locator('input[name="userId"]')).toBeVisible();
    await expect(page).toHaveURL(/\/user\/detail\?mode=create/);
  });

  test("SC02-IT-053 shouldUpdateUserWhenInputsAreValid", async ({ page }) => {
    let updateCalls = 0;
    let updatePayload: any = null;
    let detailCalls = 0;

    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);
    await page.route(/\/api\/user\/[^/]+(\?.*)?$/, async (route) => {
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
        updateCalls += 1;
        updatePayload = req.postDataJSON();
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
            ? userDetailBase
            : {
                ...userDetailBase,
                surname: "UpdatedSurname",
                givenName: "UpdatedGiven",
                mobileNo: "09077776666",
                roleName: "ROLE_EDIT",
                roleId: 2,
              };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: detail }),
        });
        return;
      }

      await route.fallback();
    });

    await openUserDetail(page, "U0001");
    await expect(page.locator('input[name="surname"]')).toHaveValue("Yamada");

    await page.getByRole("button", { name: "更新" }).click();
    await page.locator('input[name="surname"]').fill("UpdatedSurname");
    await page.locator('input[name="givenName"]').fill("UpdatedGiven");
    await page.locator('input[name="phoneNumber"]').fill("09077776666");
    await page.locator("div[role='combobox']").first().click();
    await page.getByRole("option", { name: "ROLE_EDIT" }).click();
    await page.getByRole("button", { name: "登録" }).click();

    await expect.poll(() => updateCalls).toBe(1);
    expect(updatePayload).toMatchObject({
      surname: "UpdatedSurname",
      givenName: "UpdatedGiven",
      phoneNo: "09077776666",
      roleId: 2,
    });
    await expect(page.locator('input[name="surname"]')).toHaveValue("UpdatedSurname");
    await expect(page.locator('input[name="givenName"]')).toHaveValue("UpdatedGiven");
  });

  test("SC02-IT-062 shouldRetainUserInputsWhenUserUpdateFails", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase);
    let updateCalls = 0;
    await mockUserUpdate(page, 500, {
      capture: () => {
        updateCalls += 1;
      },
    });

    await openUserDetail(page, "U0001");
    await expect(page.locator('input[name="userId"]')).toHaveValue("U0001");
    await expect(page.locator('input[name="surname"]')).toHaveValue("Yamada");
    await expect(page.locator('input[name="givenName"]')).toHaveValue("Taro");

    await page.getByRole("button", { name: "更新" }).click();
    await expect(page.getByRole("button", { name: "登録" })).toBeVisible();

    await page.locator('input[name="surname"]').fill("FailureKeepSurname");
    await page.locator('input[name="givenName"]').fill("FailureKeepGiven");
    await page.locator('input[name="phoneNumber"]').fill("09099998888");

    await page.getByRole("button", { name: "登録" }).click();

    await expect.poll(() => updateCalls).toBe(1);
    await expect(page.locator('input[name="surname"]')).toHaveValue("FailureKeepSurname");
    await expect(page.locator('input[name="givenName"]')).toHaveValue("FailureKeepGiven");
    await expect(page.locator('input[name="phoneNumber"]')).toHaveValue("09099998888");
    await expect(page.getByRole("button", { name: "登録" })).toBeVisible();
  });
});
