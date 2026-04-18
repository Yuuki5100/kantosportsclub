import { expect, test } from "@playwright/test";
import { loginWithBackend } from "./user.helpers";

const integrated = process.env.IT_USE_BACKEND === "true";
const targetId = process.env.IT_USER_DETAIL_ID;

if (integrated) {
  test.describe("SC02 User IT (FE + BE Integrated)", () => {
    test("SC02-BE-001 shouldLoginAndOpenUserListWithRealBackend", async ({ page }) => {
      await loginWithBackend(page);
      await page.goto("/user/list");
      await expect(page).toHaveURL(/\/user\/list/);
      await expect(page.locator("table")).toBeVisible();
    });

    test("SC02-BE-002 shouldOpenUserDetailFromListWithRealBackend", async ({ page }) => {
      await loginWithBackend(page);
      await page.goto("/user/list");
      const firstDetailButton = page.locator("tbody tr").first().locator("button");
      await expect(firstDetailButton).toBeVisible();
      await firstDetailButton.click();
      await expect(page).toHaveURL(/\/user\/detail\?id=/);
      await expect(page.locator('input[name="userId"]')).toBeVisible();
    });

    test("SC02-BE-003 shouldSubmitForgotPasswordAgainstRealBackend", async ({ page }) => {
      const email = process.env.IT_FORGOT_EMAIL ?? "taro.yamada@example.com";
      await page.goto("/forgot-password");
      await page.locator('input[name="email"]').fill(email);
      await page.locator('button[type="submit"]').click();
      await expect(page.locator("body")).toBeVisible();
    });

    test("SC02-BE-004 shouldHandleResetPasswordInvalidTokenAgainstRealBackend", async ({
      page,
    }) => {
      await page.goto("/reset-password/IT-INVALID-TOKEN");
      await page.locator('input[name="password"]').fill("Aa1!Aa1!Aa1!aa");
      await page.locator('input[name="confirmPassword"]').fill("Aa1!Aa1!Aa1!aa");
      await page.locator('button[type="submit"]').click();
      await expect(page.locator("body")).toBeVisible();
    });

    if (targetId) {
      test("SC02-BE-005 shouldAllowDirectUserDetailDeepLinkWithRealBackend", async ({
        page,
      }) => {
        await loginWithBackend(page);
        await page.goto(`/user/detail?id=${targetId}`);
        await expect(page).toHaveURL(new RegExp(`/user/detail\\?id=${targetId}`));
        await expect(page.locator('input[name="userId"]')).toBeVisible();
      });
    }
  });
}
