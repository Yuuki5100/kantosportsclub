import { expect, Page } from "@playwright/test";
import {
  mockAuthStatus,
  mockSystemSettings,
  systemSettingsSuccessBody,
} from "../auth/auth.helpers";
import type {
  DelayedRequestCaptureOptions,
  JsonBody,
  RequestCaptureOptions,
} from "../shared/routeTypes";

type RoleListItem = {
  roleId: number;
  roleName: string;
  description: string;
  updatedAt: string;
};

type RoleDetailData = {
  roleId: number;
  roleName: string;
  isDeleted: boolean;
  deletionReason: string | null;
  description: string;
  creatorUserName: string;
  creatorUserId: string;
  createdAt: string;
  editorUserName: string;
  editorUserId: string;
  updatedAt: string;
  permissionDetails: Array<{
    module: string;
    permissions: Array<{
      rolePermissionId: number;
      permissionId: number;
      permissionName: string;
      statusLevelId: number;
      statusLevelName: string;
    }>;
  }>;
};

const json = (body: JsonBody, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

export const roleListBase: RoleListItem[] = [
  {
    roleId: 1,
    roleName: "ROLE_VIEW_ONLY",
    description: "View only role",
    updatedAt: "2026-02-15T10:00:00Z",
  },
  {
    roleId: 2,
    roleName: "ROLE_EDIT",
    description: "Edit role",
    updatedAt: "2026-02-15T09:00:00Z",
  },
];

export const roleDetailBase: RoleDetailData = {
  roleId: 2,
  roleName: "ROLE_EDIT",
  isDeleted: false,
  deletionReason: null,
  description: "Edit role",
  creatorUserName: "Admin",
  creatorUserId: "admin",
  createdAt: "2026-02-01T00:00:00Z",
  editorUserName: "Admin",
  editorUserId: "admin",
  updatedAt: "2026-02-15T10:00:00Z",
  permissionDetails: [
    {
      module: "SYSTEM",
      permissions: [
        {
          rolePermissionId: 1,
          permissionId: 1,
          permissionName: "USER",
          statusLevelId: 2,
          statusLevelName: "VIEW",
        },
        {
          rolePermissionId: 2,
          permissionId: 2,
          permissionName: "ROLE",
          statusLevelId: 3,
          statusLevelName: "EDIT",
        },
        {
          rolePermissionId: 3,
          permissionId: 3,
          permissionName: "SYSTEM_SETTINGS",
          statusLevelId: 1,
          statusLevelName: "NONE",
        },
      ],
    },
    {
      module: "MANUAL",
      permissions: [
        {
          rolePermissionId: 4,
          permissionId: 5,
          permissionName: "MANUAL",
          statusLevelId: 2,
          statusLevelName: "VIEW",
        },
      ],
    },
  ],
};

export async function mockAuthenticatedRole(
  page: Page,
  rolePermissions: Record<string, number>
) {
  await mockAuthStatus(page, {
    success: true,
    data: {
      authenticated: true,
      rolePermissions,
      user: { userId: "validuser", givenName: "Valid", surname: "User" },
    },
  });
  await mockSystemSettings(page, systemSettingsSuccessBody);
}

export async function mockRoleList(
  page: Page,
  roles: RoleListItem[] = [],
  total = roles.length,
  status = 200,
  options?: DelayedRequestCaptureOptions
) {
  await page.route(/\/api\/roles\/list(\?.*)?$/, async (route) => {
    if (options?.delayMs) {
      await page.waitForTimeout(options.delayMs);
    }
    options?.capture?.(route.request());
    await route.fulfill(json({ success: true, data: { roles, total } }, status));
  });
}

export async function mockRoleDetail(
  page: Page,
  detail: RoleDetailData = roleDetailBase,
  status = 200,
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/roles\/\d+(\?.*)?$/, async (route) => {
    const req = route.request();
    if (req.method() !== "GET") {
      await route.fallback();
      return;
    }
    options?.capture?.(req);
    await route.fulfill(json({ success: true, data: detail }, status));
  });
}

export async function mockRoleCreate(
  page: Page,
  status = 200,
  response: JsonBody = { success: true, data: { roleId: 3001 } },
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/roles\/create(\?.*)?$/, async (route) => {
    const req = route.request();
    if (req.method() !== "POST") {
      await route.fallback();
      return;
    }
    options?.capture?.(req);
    await route.fulfill(json(response, status));
  });
}

export async function mockRoleUpdate(
  page: Page,
  status = 200,
  response: JsonBody = { success: true, data: {} },
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/roles\/\d+(\?.*)?$/, async (route) => {
    const req = route.request();
    if (req.method() !== "PUT" || /\/delete(\?.*)?$/.test(req.url())) {
      await route.fallback();
      return;
    }
    options?.capture?.(req);
    await route.fulfill(json(response, status));
  });
}

export async function mockRoleDelete(
  page: Page,
  status = 200,
  response: JsonBody = { success: true, data: {} },
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/roles\/\d+\/delete(\?.*)?$/, async (route) => {
    const req = route.request();
    if (req.method() !== "PUT") {
      await route.fallback();
      return;
    }
    options?.capture?.(req);
    await route.fulfill(json(response, status));
  });
}

export async function openRoleList(page: Page) {
  await page.goto("/role/list");
  await expect(page).toHaveURL(/\/role\/list|\/403|\/login/);
}

export async function openRoleDetail(page: Page, roleId = 2) {
  await page.goto(`/role/detail?id=${roleId}`);
  await expect(page).toHaveURL(new RegExp(`/role/detail\\?id=${roleId}|/403|/login`));
}

export async function openRoleCreate(page: Page) {
  await page.goto("/role/detail?mode=create");
  await expect(page).toHaveURL(/\/role\/detail\?mode=create|\/403|\/login/);
}

export async function clickRoleSearch(page: Page) {
  const details = page
    .locator('input[name="searchName"]')
    .locator("xpath=ancestor::div[contains(@class,'MuiAccordionDetails-root')][1]");
  const searchButton = details.locator("button:not([aria-expanded])").first();
  await expect(searchButton).toBeVisible();
  await searchButton.click();
}

export async function clickRoleNewFromList(page: Page) {
  const newButtonByLabel = page.getByRole("button", {
    name: /新規|Create|譁ｰ隕・/i,
  });
  if ((await newButtonByLabel.count()) > 0) {
    await newButtonByLabel.first().click();
    return;
  }

  const fallback = page
    .locator("table")
    .first()
    .locator('xpath=preceding::button[contains(@class,"MuiButton-root")][2]');
  await expect(fallback).toBeVisible();
  await fallback.click();
}

export async function clickPrimaryRoleAction(page: Page) {
  const roleName = page.locator('input[name="roleName"]');
  await expect(roleName).toBeVisible();
  const button = roleName.locator("xpath=preceding::button[1]");
  await expect(button).toBeVisible();
  await button.click();
}

export async function clickDeleteRoleAction(page: Page) {
  const roleName = page.locator('input[name="roleName"]');
  await expect(roleName).toBeVisible();
  const button = roleName.locator("xpath=preceding::button[2]");
  await expect(button).toBeVisible();
  await button.click();
}
