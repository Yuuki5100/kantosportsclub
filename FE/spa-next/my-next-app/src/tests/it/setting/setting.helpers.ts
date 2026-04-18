import { expect, Page } from '@playwright/test';
import type { SystemSettingUpdateRequest } from '@/types/systemSetting';
import { statusSuccessBody, systemSettingsSuccessBody } from '../auth/auth.helpers';
import type { JsonBody } from '../shared/routeTypes';

type SystemSettingItem = {
  settingID:
    | 'PASSWORD_VALID_DAYS'
    | 'PASSWORD_REISSUE_URL_EXPIRATION'
    | 'NUMBER_OF_RETRIES'
    | 'NUMBER_OF_NOTICES'
    | string;
  value: string;
};

type RouteOptions = {
  getStatus?: number;
  putStatus?: number;
  getDelayMs?: number;
  putDelayMs?: number;
  getBody?: JsonBody;
  putBody?: JsonBody;
  onGet?: () => void;
  onPut?: (payload: SystemSettingUpdateRequest) => void;
};

const json = (body: JsonBody, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const defaultSettingItems: SystemSettingItem[] = [
  { settingID: 'PASSWORD_VALID_DAYS', value: '90' },
  { settingID: 'PASSWORD_REISSUE_URL_EXPIRATION', value: '24' },
  { settingID: 'NUMBER_OF_RETRIES', value: '3' },
  { settingID: 'NUMBER_OF_NOTICES', value: '10' },
];

export const buildSystemSettingsBody = (
  items: SystemSettingItem[] = defaultSettingItems
): JsonBody => ({
  success: true,
  data: {
    data: {
      systemSettings: items,
    },
  },
});

export const updatedSettingItems: SystemSettingItem[] = [
  { settingID: 'PASSWORD_VALID_DAYS', value: '120' },
  { settingID: 'PASSWORD_REISSUE_URL_EXPIRATION', value: '48' },
  { settingID: 'NUMBER_OF_RETRIES', value: '5' },
  { settingID: 'NUMBER_OF_NOTICES', value: '12' },
];

export async function mockSettingSession(page: Page, canEdit = true) {
  const rolePermissions = {
    ...statusSuccessBody.data.rolePermissions,
    SYSTEM_SETTINGS: canEdit ? 3 : 2,
  };

  await page.route(/\/api\/auth\/status(\?.*)?$/, async (route) => {
    await route.fulfill(
      json({
        success: true,
        data: {
          ...statusSuccessBody.data,
          rolePermissions,
        },
      })
    );
  });
}

export async function mockSettingApis(page: Page, options: RouteOptions = {}) {
  const {
    getStatus = 200,
    putStatus = 200,
    getDelayMs = 0,
    putDelayMs = 0,
    getBody = systemSettingsSuccessBody,
    putBody = buildSystemSettingsBody(updatedSettingItems),
    onGet,
    onPut,
  } = options;

  await page.route(/\/api\/system(\?.*)?$/, async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      if (getDelayMs > 0) {
        await delay(getDelayMs);
      }
      onGet?.();
      await route.fulfill(json(getBody, getStatus));
      return;
    }

    if (method === 'PUT') {
      if (putDelayMs > 0) {
        await delay(putDelayMs);
      }
      onPut?.(route.request().postDataJSON() as SystemSettingUpdateRequest);
      await route.fulfill(json(putBody, putStatus));
      return;
    }

    await route.fallback();
  });
}

export async function openSettingScreen(page: Page) {
  await page.goto('/settings');
  await expect(page.locator('input[name="passwordExpiryDays"]')).toBeVisible({ timeout: 10000 });
}

export function settingInput(
  page: Page,
  name:
    | 'passwordExpiryDays'
    | 'passwordReissueUrlValidHours'
    | 'passwordRetryCount'
    | 'noticeDisplayCount'
) {
  return page.locator(`input[name="${name}"]`);
}

export async function clickEditOrSave(page: Page) {
  const named = page.getByRole('button', { name: /更新|保存/ }).first();
  if ((await named.count()) > 0) {
    await expect(named).toBeVisible();
    await named.click();
    return;
  }

  // Fallback when runtime text encoding causes name matching to fail.
  const fallback = page.locator('button.MuiButton-root').first();
  await expect(fallback).toBeVisible();
  await fallback.click();
}

export async function fillSettingValues(
  page: Page,
  values: {
    passwordExpiryDays?: string;
    passwordReissueUrlValidHours?: string;
    passwordRetryCount?: string;
    noticeDisplayCount?: string;
  }
) {
  if (values.passwordExpiryDays !== undefined) {
    await settingInput(page, 'passwordExpiryDays').fill(values.passwordExpiryDays);
  }
  if (values.passwordReissueUrlValidHours !== undefined) {
    await settingInput(page, 'passwordReissueUrlValidHours').fill(
      values.passwordReissueUrlValidHours
    );
  }
  if (values.passwordRetryCount !== undefined) {
    await settingInput(page, 'passwordRetryCount').fill(values.passwordRetryCount);
  }
  if (values.noticeDisplayCount !== undefined) {
    await settingInput(page, 'noticeDisplayCount').fill(values.noticeDisplayCount);
  }
}

export async function expectSettingValues(
  page: Page,
  values: {
    passwordExpiryDays: string;
    passwordReissueUrlValidHours: string;
    passwordRetryCount: string;
    noticeDisplayCount: string;
  }
) {
  await expect(settingInput(page, 'passwordExpiryDays')).toHaveValue(values.passwordExpiryDays);
  await expect(settingInput(page, 'passwordReissueUrlValidHours')).toHaveValue(
    values.passwordReissueUrlValidHours
  );
  await expect(settingInput(page, 'passwordRetryCount')).toHaveValue(values.passwordRetryCount);
  await expect(settingInput(page, 'noticeDisplayCount')).toHaveValue(values.noticeDisplayCount);
}

export async function expectSnackbarVisible(page: Page) {
  await expect(page.getByTestId('snackbar-container')).toBeVisible();
}
