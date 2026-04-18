import { expect, Page } from "@playwright/test";
import {
  fillLoginAndSubmit,
  mockAuthStatus,
  mockSystemSettings,
  systemSettingsSuccessBody,
} from "../auth/auth.helpers";

type JsonBody = Record<string, unknown>;

type UserListItem = {
  userId: string;
  email: string;
  surname: string;
  givenName: string;
  roleId: number;
  roleName: string;
  isLocked: boolean;
  failedLoginAttempts: number;
  lockedAt: string | null;
  updatedAt: string;
};

type UserDetail = {
  userId: string;
  email: string;
  surname: string;
  givenName: string;
  roleName: string;
  roleId: number;
  isLocked: boolean;
  isDeleted: boolean;
  mobileNo: string;
  passwordSetTime: string | null;
  failedLoginAttempts: number;
  lockOutTime: string | null;
  deletionReason: string;
  creatorUserId: string;
  createdAt: string | null;
  creatorUserName: string;
  editorUserId: string;
  editorUserName: string;
  updatedAt: string | null;
};

const json = (body: JsonBody, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const isDocumentRequest = (page: Page, route: any) => {
  const request = route.request();
  if (request.resourceType() === "document") return true;
  const accept = request.headers()["accept"] ?? "";
  if (accept.includes("text/html")) return true;
  const currentOrigin = new URL(page.url() === "about:blank" ? "http://127.0.0.1:3000" : page.url()).origin;
  const requestUrl = new URL(request.url());
  return (
    requestUrl.origin === currentOrigin &&
    /^\/user\/(list|detail)(\/|$)/.test(requestUrl.pathname)
  );
};

export const userListBase: UserListItem[] = [
  {
    userId: "U0001",
    email: "taro.yamada@example.com",
    surname: "Yamada",
    givenName: "Taro",
    roleId: 1,
    roleName: "ROLE_VIEW_ONLY",
    isLocked: false,
    failedLoginAttempts: 0,
    lockedAt: null,
    updatedAt: "2026-02-15T10:00:00Z",
  },
  {
    userId: "U0002",
    email: "hanako.sato@example.com",
    surname: "Sato",
    givenName: "Hanako",
    roleId: 2,
    roleName: "ROLE_EDIT",
    isLocked: true,
    failedLoginAttempts: 3,
    lockedAt: "2026-02-14T03:20:00Z",
    updatedAt: "2026-02-15T09:00:00Z",
  },
];

export const userDetailBase: UserDetail = {
  userId: "U0001",
  email: "taro.yamada@example.com",
  surname: "Yamada",
  givenName: "Taro",
  roleName: "ROLE_VIEW_ONLY",
  roleId: 1,
  isLocked: false,
  isDeleted: false,
  mobileNo: "09012345678",
  passwordSetTime: "2026-02-01T00:00:00Z",
  failedLoginAttempts: 0,
  lockOutTime: null,
  deletionReason: "",
  creatorUserId: "admin",
  createdAt: "2026-01-01T00:00:00Z",
  creatorUserName: "Admin",
  editorUserId: "admin",
  editorUserName: "Admin",
  updatedAt: "2026-02-15T10:00:00Z",
};

export const roleDropdownBase = [
  { roleId: 1, roleName: "ROLE_VIEW_ONLY" },
  { roleId: 2, roleName: "ROLE_EDIT" },
];

export async function mockAuthenticatedUser(
  page: Page,
  options?: { canEditUser?: boolean }
) {
  const canEditUser = options?.canEditUser ?? true;
  await mockAuthStatus(page, {
    success: true,
    data: {
      authenticated: true,
      rolePermissions: {
        USER: canEditUser ? 3 : 2,
        ROLE: 3,
        NOTICE: 3,
        MANUAL: 3,
        SYSTEM_SETTINGS: 3,
      },
      user: { userId: "validuser", givenName: "Valid", surname: "User" },
    },
  });
  await mockSystemSettings(page, systemSettingsSuccessBody);
}

export async function mockRoleDropdown(
  page: Page,
  roles = roleDropdownBase,
  status = 200
) {
  await page.route(/\/(?:api\/roles\/dropdown|roles\/dropdown|user\/access\/roles\/dropdown)(\?.*)?$/, async (route) => {
    if (isDocumentRequest(page, route)) {
      await route.fallback();
      return;
    }
    await route.fulfill(json({ success: true, data: { roles } }, status));
  });
}

export async function mockUserList(
  page: Page,
  users: UserListItem[] = [],
  total = users.length,
  status = 200,
  options?: { capture?: (req: any) => void; delayMs?: number }
) {
  await page.route(/\/(?:api\/user\/list|user\/access\/list|user\/list)(\?.*)?$/, async (route) => {
    if (isDocumentRequest(page, route)) {
      await route.fallback();
      return;
    }
    if (options?.delayMs) {
      await page.waitForTimeout(options.delayMs);
    }
    options?.capture?.(route.request());
    await route.fulfill(json({ success: true, data: { users, total } }, status));
  });
}

export async function mockUserDetail(
  page: Page,
  detail: UserDetail = userDetailBase,
  status = 200,
  options?: { capture?: (req: any) => void }
) {
  await page.route(/\/(?:api\/user|user\/access)\/[^/]+(\?.*)?$/, async (route) => {
    if (isDocumentRequest(page, route)) {
      await route.fallback();
      return;
    }
    const req = route.request();
    if (req.method() !== "GET") {
      await route.fallback();
      return;
    }
    const url = req.url();
    if (
      url.includes("/api/user/list") ||
      url.includes("/user/access/list") ||
      url.includes("/user/list") ||
      url.includes("/api/user/create") ||
      url.includes("/user/access/create") ||
      url.includes("/user/create") ||
      url.includes("/api/user/unlock") ||
      url.includes("/user/access/unlock") ||
      url.includes("/user/unlock") ||
      url.includes("/api/user/forgot-password") ||
      url.includes("/user/access/forgot-password") ||
      url.includes("/user/forgot-password") ||
      url.includes("/api/user/reset-password") ||
      url.includes("/user/access/reset-password") ||
      url.includes("/user/reset-password")
    ) {
      await route.fallback();
      return;
    }
    options?.capture?.(req);
    await route.fulfill(json({ success: true, data: detail }, status));
  });
}

export async function mockUserUpdate(
  page: Page,
  status = 200,
  options?: { capture?: (req: any) => void }
) {
  await page.route(/\/(?:api\/user|user\/access)(?:\/[^/?]+)?(\?.*)?$/, async (route) => {
    if (isDocumentRequest(page, route)) {
      await route.fallback();
      return;
    }
    const req = route.request();
    if (req.method() !== "PUT") {
      await route.fallback();
      return;
    }
    const url = req.url();
    if (
      url.includes("/delete") ||
      url.includes("/restore") ||
      url.includes("/unlock") ||
      url.includes("/reset-password")
    ) {
      await route.fallback();
      return;
    }
    options?.capture?.(req);
    await route.fulfill(json({ success: true, data: {} }, status));
  });
}

export async function mockForgotPassword(
  page: Page,
  status = 200,
  options?: { capture?: (req: any) => void }
) {
  await page.route(/\/(?:api\/user\/forgot-password|user\/access\/forgot-password|user\/forgot-password)(\?.*)?$/, async (route) => {
    if (isDocumentRequest(page, route)) {
      await route.fallback();
      return;
    }
    options?.capture?.(route.request());
    await route.fulfill(json({ success: true, data: {} }, status));
  });
}

export async function mockResetPassword(
  page: Page,
  status = 200,
  options?: { capture?: (req: any) => void }
) {
  await page.route(/\/(?:api\/user\/reset-password|user\/access\/reset-password|user\/reset-password)\/[^/]+(\?.*)?$/, async (route) => {
    if (isDocumentRequest(page, route)) {
      await route.fallback();
      return;
    }
    options?.capture?.(route.request());
    await route.fulfill(json({ success: true, data: {} }, status));
  });
}

export async function openUserList(page: Page) {
  await page.goto("/user/list");
  await expect(page).toHaveURL(/\/user\/list/);
  await expect(page.locator("table")).toBeVisible();
}

export async function openUserDetail(page: Page, userId = "U0001") {
  await page.goto(`/user/detail?id=${userId}`);
  await expect(page).toHaveURL(new RegExp(`/user/detail\\?id=${userId}`));
  await expect(page.locator('input[name="userId"]')).toBeVisible();
}

export async function clickSearch(page: Page) {
  const details = page
    .locator('input[name="searchName"]')
    .locator("xpath=ancestor::div[contains(@class,'MuiAccordionDetails-root')][1]");
  const searchButton = details.locator("button:not([aria-expanded])").first();
  await expect(searchButton).toBeVisible();
  await searchButton.click();
}

export async function loginWithBackend(page: Page) {
  const userId = process.env.IT_USER_ID;
  const password = process.env.IT_USER_PASSWORD;
  if (!userId || !password) {
    throw new Error("Set IT_USER_ID and IT_USER_PASSWORD for backend integrated IT.");
  }

  await page.goto("/login");
  await fillLoginAndSubmit(page, userId, password);
  await expect(page.getByTestId("logout-button")).toBeVisible({ timeout: 15000 });
}

