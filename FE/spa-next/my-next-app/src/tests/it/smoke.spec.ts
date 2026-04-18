import { expect, test } from "@playwright/test";

test("login page renders basic fields", async ({ page }) => {
  await page.goto("/login");

  await expect(page.locator('input[name="username"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});
