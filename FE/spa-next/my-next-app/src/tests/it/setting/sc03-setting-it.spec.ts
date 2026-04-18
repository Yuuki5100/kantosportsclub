import { expect, test } from '@playwright/test';
import {
  buildSystemSettingsBody,
  clickEditOrSave,
  expectSettingValues,
  fillSettingValues,
  mockSettingSession,
  openSettingScreen,
} from './setting.helpers';

type SettingPayload = {
  passwordValidDays: number;
  passwordReissueUrlExpiration: number;
  numberOfRetries: number;
  numberOfNotices: number;
};

const toSystemSettingsBody = (payload: SettingPayload) =>
  buildSystemSettingsBody([
    { settingID: 'PASSWORD_VALID_DAYS', value: String(payload.passwordValidDays) },
    {
      settingID: 'PASSWORD_REISSUE_URL_EXPIRATION',
      value: String(payload.passwordReissueUrlExpiration),
    },
    { settingID: 'NUMBER_OF_RETRIES', value: String(payload.numberOfRetries) },
    { settingID: 'NUMBER_OF_NOTICES', value: String(payload.numberOfNotices) },
  ]);

test.describe('SC03 SystemSetting IT', () => {
  test('SC03-IT-040 shouldDisplayUpdatedSystemSettingsAfterSaveAndReload', async ({ page }) => {
    await mockSettingSession(page, true);

    let currentPayload: SettingPayload = {
      passwordValidDays: 90,
      passwordReissueUrlExpiration: 24,
      numberOfRetries: 3,
      numberOfNotices: 10,
    };

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      const method = route.request().method();
      if (method === 'PUT') {
        currentPayload = route.request().postDataJSON() as SettingPayload;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(toSystemSettingsBody(currentPayload)),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(toSystemSettingsBody(currentPayload)),
      });
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await fillSettingValues(page, {
      passwordExpiryDays: '120',
      passwordReissueUrlValidHours: '48',
      passwordRetryCount: '6',
      noticeDisplayCount: '20',
    });
    await clickEditOrSave(page);

    await page.reload();

    await expectSettingValues(page, {
      passwordExpiryDays: '120',
      passwordReissueUrlValidHours: '48',
      passwordRetryCount: '6',
      noticeDisplayCount: '20',
    });
  });

  test('SC03-IT-041 shouldMaintainSystemSettingsStateAfterBackOrReload', async ({ page }) => {
    await mockSettingSession(page, true);

    let currentPayload: SettingPayload = {
      passwordValidDays: 90,
      passwordReissueUrlExpiration: 24,
      numberOfRetries: 3,
      numberOfNotices: 10,
    };

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      const method = route.request().method();
      if (method === 'PUT') {
        currentPayload = route.request().postDataJSON() as SettingPayload;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(toSystemSettingsBody(currentPayload)),
      });
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);
    await fillSettingValues(page, {
      passwordExpiryDays: '88',
      passwordReissueUrlValidHours: '22',
      passwordRetryCount: '4',
      noticeDisplayCount: '16',
    });
    await clickEditOrSave(page);

    await page.goto('/login');
    await page.goto('/settings');

    await expectSettingValues(page, {
      passwordExpiryDays: '88',
      passwordReissueUrlValidHours: '22',
      passwordRetryCount: '4',
      noticeDisplayCount: '16',
    });
  });

  test('SC03-IT-047 shouldMaintainConsistencyBetweenDependentSystemSettings', async ({ page }) => {
    await mockSettingSession(page, true);

    let capturedPayload: SettingPayload | null = null;

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      const method = route.request().method();
      if (method === 'PUT') {
        capturedPayload = route.request().postDataJSON() as SettingPayload;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(toSystemSettingsBody(capturedPayload)),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          toSystemSettingsBody({
            passwordValidDays: 90,
            passwordReissueUrlExpiration: 24,
            numberOfRetries: 3,
            numberOfNotices: 10,
          })
        ),
      });
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await fillSettingValues(page, {
      passwordExpiryDays: '72',
      passwordReissueUrlValidHours: '24',
      passwordRetryCount: '5',
      noticeDisplayCount: '15',
    });

    await clickEditOrSave(page);

    await expect.poll(() => capturedPayload).toEqual({
      passwordValidDays: 72,
      passwordReissueUrlExpiration: 24,
      numberOfRetries: 5,
      numberOfNotices: 15,
    });

    expect((capturedPayload as SettingPayload).passwordValidDays).toBeGreaterThanOrEqual(
      (capturedPayload as SettingPayload).passwordReissueUrlExpiration
    );
  });

  test('SC03-IT-050 shouldAllowReUpdatingSystemSettingsCorrectly', async ({ page }) => {
    await mockSettingSession(page, true);

    let putCount = 0;
    let currentPayload: SettingPayload = {
      passwordValidDays: 90,
      passwordReissueUrlExpiration: 24,
      numberOfRetries: 3,
      numberOfNotices: 10,
    };

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      const method = route.request().method();
      if (method === 'PUT') {
        putCount += 1;
        currentPayload = route.request().postDataJSON() as SettingPayload;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(toSystemSettingsBody(currentPayload)),
      });
    });

    await openSettingScreen(page);

    await clickEditOrSave(page);
    await fillSettingValues(page, {
      passwordExpiryDays: '100',
      passwordReissueUrlValidHours: '30',
      passwordRetryCount: '4',
      noticeDisplayCount: '12',
    });
    await clickEditOrSave(page);

    await clickEditOrSave(page);
    await fillSettingValues(page, {
      passwordExpiryDays: '110',
      passwordReissueUrlValidHours: '36',
      passwordRetryCount: '6',
      noticeDisplayCount: '18',
    });
    await clickEditOrSave(page);

    await expect.poll(() => putCount).toBe(2);
    await expectSettingValues(page, {
      passwordExpiryDays: '110',
      passwordReissueUrlValidHours: '36',
      passwordRetryCount: '6',
      noticeDisplayCount: '18',
    });
  });
});

