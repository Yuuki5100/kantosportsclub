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

type NoticeListItem = {
  noticeId: number;
  noticeTitle: string;
  startDate: string;
  endDate: string;
  creatorUserName: string;
  createdAt: string;
};

type NoticeDetailItem = {
  noticeId: number;
  noticeTitle: string;
  startDate: string;
  endDate: string;
  contents: string;
  docIds: string[];
  creatorUserName: string;
  createdAt: string;
  editorUserName: string;
  updatedAt: string;
};

const json = (body: JsonBody, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

export const noticeListBase: NoticeListItem[] = [
  {
    noticeId: 1001,
    noticeTitle: "Active Notice 1001",
    startDate: "2026/01/01",
    endDate: "2099/12/31",
    creatorUserName: "Admin",
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    noticeId: 1002,
    noticeTitle: "Active Notice 1002",
    startDate: "2026/01/02",
    endDate: "2099/12/31",
    creatorUserName: "Admin",
    createdAt: "2026-01-11T00:00:00.000Z",
  },
];

export const detail1001: NoticeDetailItem = {
  noticeId: 1001,
  noticeTitle: "Active Notice 1001",
  startDate: "2026/01/01",
  endDate: "2099/12/31",
  contents: "Notice detail contents",
  docIds: [],
  creatorUserName: "Admin",
  createdAt: "2026-01-10T00:00:00.000Z",
  editorUserName: "Admin",
  updatedAt: "2026-01-10T00:00:00.000Z",
};

export async function mockAuthenticatedShell(page: Page) {
  await mockAuthStatus(page, statusSuccessBody);
  await mockSystemSettings(page, systemSettingsSuccessBody);
}

export async function mockNoticeList(
  page: Page,
  noticeList: NoticeListItem[] = [],
  status = 200,
  options?: DelayedRequestCaptureOptions
) {
  await page.route(/\/api\/notice\/list(\?.*)?$/, async (route) => {
    if (options?.delayMs) {
      await page.waitForTimeout(options.delayMs);
    }
    options?.capture?.(route.request());
    await route.fulfill(json({ success: true, data: { noticeList } }, status));
  });
}

export async function mockNoticeDetail(
  page: Page,
  detail: NoticeDetailItem,
  status = 200,
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/notice\/notice_id(\?.*)?$/, async (route) => {
    options?.capture?.(route.request());
    await route.fulfill(json({ success: true, data: detail }, status));
  });
}

export async function mockNoticeCreate(
  page: Page,
  status = 200,
  response: JsonBody = { success: true, data: { noticeId: 3001 } },
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/notice\/create(\?.*)?$/, async (route) => {
    options?.capture?.(route.request());
    await route.fulfill(json(response, status));
  });
}

export async function mockNoticeUpdate(
  page: Page,
  status = 200,
  response: JsonBody = { success: true, data: {} },
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/notice\/notice_id(\?.*)?$/, async (route) => {
    if (route.request().method() !== "PUT") {
      await route.fallback();
      return;
    }
    options?.capture?.(route.request());
    await route.fulfill(json(response, status));
  });
}

export async function mockNoticeUpload(
  page: Page,
  status = 200,
  response: JsonBody = { success: true, data: { docIds: ["guide.pdf"] } },
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/notice\/upload(\?.*)?$/, async (route) => {
    options?.capture?.(route.request());
    await route.fulfill(json(response, status));
  });
}

export async function mockNoticeDownload(
  page: Page,
  status = 200,
  options?: RequestCaptureOptions
) {
  await page.route(/\/api\/notice\/download(\?.*)?$/, async (route) => {
    options?.capture?.(route.request());
    await route.fulfill({
      status,
      contentType: "application/octet-stream",
      body: "dummy-binary",
    });
  });
}

export async function openTop(page: Page) {
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("table")).toBeVisible();
}

export function getModal(page: Page) {
  return page
    .locator('button[aria-label="close"]')
    .last()
    .locator("xpath=ancestor::div[2]");
}

export async function openFirstDetail(page: Page) {
  const firstRow = page.locator("tbody tr").first();
  await expect(firstRow).toBeVisible();
  await firstRow.locator("button").first().click();
  await expect(page.locator('button[aria-label="close"]').last()).toBeVisible({
    timeout: 10000,
  });
}

export async function openCreatePopup(page: Page) {
  const createButton = page
    .locator("table")
    .first()
    .locator('xpath=preceding::button[contains(@class,"MuiButton-root")][1]');
  await createButton.click();
  await expect(page.locator('button[aria-label="close"]').last()).toBeVisible({
    timeout: 10000,
  });
}

export async function fillNoticeForm(
  page: Page,
  args: { title: string; startDate: string; endDate: string; content: string }
) {
  const dialog = getModal(page);
  await dialog.locator('input[name="title"]').fill(args.title);

  const dateInputs = dialog.locator('input[placeholder="YYYY/MM/DD"]');
  await dateInputs.nth(0).fill(args.startDate);
  await dateInputs.nth(1).fill(args.endDate);

  await dialog.locator('textarea[name="content"]').fill(args.content);
}

export async function clickDialogPrimaryButton(page: Page) {
  const button = getModal(page)
    .locator('button:not([aria-label="close"])')
    .last();
  await button.click();
}
