import { expect, Page } from "@playwright/test";
import {
  mockAuthStatus,
  mockSystemSettings,
  statusSuccessBody,
  systemSettingsSuccessBody,
} from "../auth/auth.helpers";
import type {
  DelayedRequestCaptureOptions,
  JsonBody,
  RequestCaptureOptions,
} from "../shared/routeTypes";

export type ManualListItem = {
  manualId: number;
  manualTitle: string;
  generalUser: boolean;
  systemUser: boolean;
  updatedBy: string;
  updatedAt: string;
};

export type ManualDetailItem = {
  manualId: number;
  manualTitle: string;
  description: string;
  generalUser: boolean;
  systemUser: boolean;
  updatedAt: string;
  docIds: string[];
  deletedFlag: boolean;
};

const json = (body: JsonBody, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

export const manualListBase: ManualListItem[] = [
  {
    manualId: 1001,
    manualTitle: "Manual Alpha",
    generalUser: true,
    systemUser: false,
    updatedBy: "Admin",
    updatedAt: "2026/02/16 09:00:00",
  },
  {
    manualId: 1002,
    manualTitle: "Manual Beta",
    generalUser: false,
    systemUser: true,
    updatedBy: "Admin",
    updatedAt: "2026/02/15 09:00:00",
  },
];

export const manualDetail1001: ManualDetailItem = {
  manualId: 1001,
  manualTitle: "Manual Alpha",
  description: "Manual detail contents",
  generalUser: true,
  systemUser: false,
  updatedAt: "2026/02/16 09:00:00",
  docIds: [],
  deletedFlag: false,
};

export async function mockAuthenticatedShell(page: Page) {
  await mockAuthStatus(page, statusSuccessBody);
  await mockSystemSettings(page, systemSettingsSuccessBody);
}

export async function mockReadOnlyManualShell(page: Page) {
  await mockAuthStatus(page, {
    success: true,
    data: {
      authenticated: true,
      rolePermissions: {
        MANUAL: 2,
      },
      user: { userId: "readonly", givenName: "Read", surname: "Only" },
    },
  });
  await mockSystemSettings(page, systemSettingsSuccessBody);
}

export async function mockManualList(
  page: Page,
  manuals: ManualListItem[] = [],
  total = manuals.length,
  status = 200,
  options?: DelayedRequestCaptureOptions
) {
  await page.route(/\/api\/manual\/list(\?.*)?$/, async (route) => {
    if (options?.delayMs) {
      await page.waitForTimeout(options.delayMs);
    }
    options?.capture?.(route.request());
    await route.fulfill(json({ success: true, data: { manuals, total } }, status));
  });
}

export async function mockManualDetail(
  page: Page,
  manual: ManualDetailItem = manualDetail1001,
  status = 200,
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/manual\/\d+(\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    options?.capture?.(route.request());
    await route.fulfill(json({ success: true, data: { manual } }, status));
  });
}

export async function mockManualCreate(
  page: Page,
  status = 200,
  response: JsonBody = { success: true, data: { manualId: 3001 } },
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/manual\/create(\?.*)?$/, async (route) => {
    options?.capture?.(route.request());
    await route.fulfill(json(response, status));
  });
}

export async function mockManualUpload(
  page: Page,
  status = 200,
  response: JsonBody = { success: true, data: { docIds: ["guide.pdf"] } },
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/manual\/upload(\?.*)?$/, async (route) => {
    options?.capture?.(route.request());
    await route.fulfill(json(response, status));
  });
}

export async function mockManualDownload(
  page: Page,
  status = 200,
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/manual\/download(\?.*)?$/, async (route) => {
    options?.capture?.(route.request());
    await route.fulfill({
      status,
      contentType: "application/octet-stream",
      body: "dummy-binary",
    });
  });
}

export async function openManualList(page: Page) {
  await page.goto("/manual/list");
  await expect(page).toHaveURL(/\/manual\/list(?:\?.*)?$/);
  await expect(page.locator("table")).toBeVisible({ timeout: 15000 });
}

export async function openFirstDetail(page: Page) {
  const firstRow = page.locator("tbody tr").first();
  await expect(firstRow).toBeVisible();
  await firstRow.locator("button").last().click();
  await expect(page.locator('button[aria-label="close"]').last()).toBeVisible({
    timeout: 10000,
  });
}

export async function openCreatePopup(page: Page) {
  await getCreateButtonNearTable(page).first().click();
  await expect(page.locator('button[aria-label="close"]').last()).toBeVisible({
    timeout: 10000,
  });
}

export function getModal(page: Page) {
  return page
    .locator('button[aria-label="close"]')
    .last()
    .locator("xpath=ancestor::div[2]");
}

export async function clickDialogPrimaryButton(page: Page) {
  await getModal(page)
    .locator('button:not([aria-label="close"])')
    .last()
    .click();
}

export async function clickSearch(page: Page) {
  const searchInput = page.locator('input[name="searchTitle"]');
  if (!(await searchInput.isVisible())) {
    await page.getByRole("button", { name: /検索オプション|讀懃ｴ｢繧ｪ繝励す繝ｧ繝ｳ/ }).first().click();
    await expect(searchInput).toBeVisible();
  }

  const searchButton = page.getByRole("button", { name: /^検索$|^讀懃ｴ｢$/ }).first();
  await searchButton.click();
}

export function getCreateButtonNearTable(page: Page) {
  return page.getByRole("button", { name: /新規|譁ｰ隕・/ });
}
