import { expect, Page } from "@playwright/test";

type RouteJson = Record<string, unknown>;

const json = (body: RouteJson, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

export const statusSuccessBody = {
  success: true,
  data: {
    authenticated: true,
    rolePermissions: {
      SYSTEM_SETTINGS: 3,
      NOTICE: 3,
      USER: 3,
      ROLE: 3,
      MANUAL: 3,
    },
    user: { userId: "validuser", givenName: "Valid", surname: "User" },
  },
};

export const statusLoggedOutBody = {
  success: true,
  data: {
    authenticated: false,
    rolePermissions: {},
  },
};

export const loginSuccessBody = {
  success: true,
  data: {
    authenticated: true,
    givenName: "Valid",
    surname: "User",
  },
};

export const loginFailureBody = {
  success: false,
  data: {
    authenticated: false,
  },
};

export const systemSettingsSuccessBody = {
  success: true,
  data: {
    data: {
      systemSettings: [
        { settingID: "PASSWORD_VALID_DAYS", value: "90" },
        { settingID: "PASSWORD_REISSUE_URL_EXPIRATION", value: "24" },
        { settingID: "NUMBER_OF_RETRIES", value: "3" },
        { settingID: "NUMBER_OF_NOTICES", value: "10" },
      ],
    },
  },
};

export async function mockAuthStatus(
  page: Page,
  body: RouteJson = statusLoggedOutBody,
  status = 200,
  delayMs = 0
) {
  await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    await route.fulfill(json(body, status));
  });
}

export async function mockLogin(
  page: Page,
  body: RouteJson = loginSuccessBody,
  status = 200
) {
  await page.route(/\/auth\/login(\?.*)?$/, async (route) => {
    await route.fulfill(json(body, status));
  });
}

export async function mockLogout(page: Page, status = 200) {
  await page.route(/\/auth\/logout(\?.*)?$/, async (route) => {
    await route.fulfill(json({ success: true }, status));
  });
}

export async function mockRefresh(page: Page, status = 200) {
  await page.route(/\/auth\/refresh(\?.*)?$/, async (route) => {
    await route.fulfill(json({ success: true }, status));
  });
}

export async function mockSystemSettings(
  page: Page,
  body: RouteJson = systemSettingsSuccessBody,
  status = 200
) {
  await page.route(/\/api\/system(\?.*)?$/, async (route) => {
    await route.fulfill(json(body, status));
  });
}

export async function fillLoginAndSubmit(
  page: Page,
  userId = "validuser",
  password = "ValidPass123"
) {
  await page.locator('input[name="username"]').fill(userId);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
}

export async function expectOnLogin(page: Page, timeout = 15000) {
  await expect(page).toHaveURL(/\/login(?:\?.*)?$/, { timeout });
}
