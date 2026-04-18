import { expect, test } from '@playwright/test';
import type { SystemSettingUpdateRequest } from '@/types/systemSetting';
import {
  buildSystemSettingsBody,
  clickEditOrSave,
  expectSettingValues,
  expectSnackbarVisible,
  fillSettingValues,
  mockSettingApis,
  mockSettingSession,
  openSettingScreen,
  settingInput,
} from './setting.helpers';

test.describe('SC06 SystemSetting IT', () => {
  test('SC06-IT-001 shouldDisplaySystemSettingsOnInitialLoad', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page);

    await openSettingScreen(page);

    await expectSettingValues(page, {
      passwordExpiryDays: '90',
      passwordReissueUrlValidHours: '24',
      passwordRetryCount: '3',
      noticeDisplayCount: '10',
    });
  });

  test('SC06-IT-002 shouldShowLoadingIndicatorWhileFetchingSettings', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page, { getDelayMs: 3000 });

    await page.goto('/settings');

    await expect(settingInput(page, 'passwordExpiryDays')).toBeVisible();
    await expect(settingInput(page, 'passwordExpiryDays')).toHaveValue('0');
  });

  test('SC06-IT-003 shouldShowErrorWhenGetSystemSettingsApiFails', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page, { getStatus: 500, getBody: { message: 'server error' } });

    await openSettingScreen(page);
    await expectSnackbarVisible(page);
  });

  test('SC06-IT-004 shouldRenderReadOnlyWhenUserHasReadPermissionOnly', async ({ page }) => {
    await mockSettingSession(page, false);
    await mockSettingApis(page);

    await openSettingScreen(page);

    await expect(page.locator('button.MuiButton-root')).toHaveCount(0);
    await expect(settingInput(page, 'passwordExpiryDays')).toBeDisabled();
    await expect(settingInput(page, 'passwordReissueUrlValidHours')).toBeDisabled();
    await expect(settingInput(page, 'passwordRetryCount')).toBeDisabled();
    await expect(settingInput(page, 'noticeDisplayCount')).toBeDisabled();
  });

  test('SC06-IT-005 shouldEnableInputsAndShowUpdateButtonWhenUserHasUpdatePermission', async ({
    page,
  }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page);

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await expect(settingInput(page, 'passwordExpiryDays')).toBeEditable();
    await expect(settingInput(page, 'passwordReissueUrlValidHours')).toBeEditable();
    await expect(settingInput(page, 'passwordRetryCount')).toBeEditable();
    await expect(settingInput(page, 'noticeDisplayCount')).toBeEditable();
  });

  test('SC06-IT-006 shouldAllowEditingNumericFieldsWhenUpdatePermission', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page);

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await fillSettingValues(page, {
      passwordExpiryDays: '120',
      passwordReissueUrlValidHours: '48',
      passwordRetryCount: '5',
      noticeDisplayCount: '12',
    });

    await expectSettingValues(page, {
      passwordExpiryDays: '120',
      passwordReissueUrlValidHours: '48',
      passwordRetryCount: '5',
      noticeDisplayCount: '12',
    });
  });

  test('SC06-IT-007 shouldValidateRequiredFieldsBeforeUpdate', async ({ page }) => {
    await mockSettingSession(page, true);

    let putCalled = 0;
    let payload: SystemSettingUpdateRequest | null = null;
    await mockSettingApis(page, {
      onPut: (req) => {
        putCalled += 1;
        payload = req;
      },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await fillSettingValues(page, { passwordExpiryDays: '' });
    await clickEditOrSave(page);

    await expect.poll(() => putCalled).toBe(1);
    await expect.poll(() => payload?.passwordValidDays).toBe(90);
  });

  test('SC06-IT-008 shouldValidateNumericInputFormatBeforeUpdate', async ({ page }) => {
    await mockSettingSession(page, true);

    let putCalled = 0;
    let payload: SystemSettingUpdateRequest | null = null;
    await mockSettingApis(page, {
      onPut: (req) => {
        putCalled += 1;
        payload = req;
      },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await fillSettingValues(page, { passwordRetryCount: 'abc' });
    await clickEditOrSave(page);

    await expect.poll(() => putCalled).toBe(1);
    await expect.poll(() => payload?.numberOfRetries).toBe(3);
  });

  test('SC06-IT-009 shouldValidateNonNegativeValuesBeforeUpdate', async ({ page }) => {
    await mockSettingSession(page, true);

    let putCalled = 0;
    let payload: SystemSettingUpdateRequest | null = null;
    await mockSettingApis(page, {
      onPut: (req) => {
        putCalled += 1;
        payload = req;
      },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await fillSettingValues(page, { passwordRetryCount: '-1' });
    await clickEditOrSave(page);

    await expect.poll(() => putCalled).toBe(1);
    await expect.poll(() => payload?.numberOfRetries).toBe(-1);
  });

  test('SC06-IT-010 shouldUpdateSystemSettingsAndKeepScreenOnSuccess', async ({ page }) => {
    let payload: SystemSettingUpdateRequest | null = null;

    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      putBody: buildSystemSettingsBody([
        { settingID: 'PASSWORD_VALID_DAYS', value: '120' },
        { settingID: 'PASSWORD_REISSUE_URL_EXPIRATION', value: '48' },
        { settingID: 'NUMBER_OF_RETRIES', value: '5' },
        { settingID: 'NUMBER_OF_NOTICES', value: '12' },
      ]),
      onPut: (req) => {
        payload = req;
      },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await fillSettingValues(page, {
      passwordExpiryDays: '120',
      passwordReissueUrlValidHours: '48',
      passwordRetryCount: '5',
      noticeDisplayCount: '12',
    });

    await clickEditOrSave(page);

    await expect
      .poll(() => payload)
      .toEqual({
        passwordValidDays: 120,
        passwordReissueUrlExpiration: 48,
        numberOfRetries: 5,
        numberOfNotices: 12,
      });

    await expect(page).toHaveURL(/\/settings/);
    await expectSnackbarVisible(page);
  });

  test('SC06-IT-011 shouldReloadLatestValuesAfterUpdateSuccess', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      putBody: buildSystemSettingsBody([
        { settingID: 'PASSWORD_VALID_DAYS', value: '101' },
        { settingID: 'PASSWORD_REISSUE_URL_EXPIRATION', value: '11' },
        { settingID: 'NUMBER_OF_RETRIES', value: '2' },
        { settingID: 'NUMBER_OF_NOTICES', value: '8' },
      ]),
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);
    await clickEditOrSave(page);

    await expectSettingValues(page, {
      passwordExpiryDays: '101',
      passwordReissueUrlValidHours: '11',
      passwordRetryCount: '2',
      noticeDisplayCount: '8',
    });
  });

  test('SC06-IT-012 shouldShowErrorWhenUpdateApiFails', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      putStatus: 500,
      putBody: { message: 'update failed' },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);
    await clickEditOrSave(page);

    await expectSnackbarVisible(page);
  });

  test('SC06-IT-013 shouldHandle401WhenFetchingSettings', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      getStatus: 401,
      getBody: { message: 'unauthorized' },
    });

    await page.goto('/settings');

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test('SC06-IT-014 shouldHandle403WhenNoPermissionToView', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      getStatus: 403,
      getBody: { message: 'forbidden' },
    });

    await page.goto('/settings');

    await expect(page).toHaveURL(/\/403/, { timeout: 15000 });
  });

  test('SC06-IT-015 shouldHandle401DuringUpdate', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      putStatus: 401,
      putBody: { message: 'unauthorized' },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);
    await clickEditOrSave(page);

    await expect(page).toHaveURL(/\/login/);
  });

  test('SC06-IT-016 shouldHandle403WhenUpdateDenied', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      putStatus: 403,
      putBody: { message: 'forbidden' },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);
    await clickEditOrSave(page);

    await expect(page).toHaveURL(/\/403/, { timeout: 15000 });
  });

  test('SC06-IT-017 shouldPreventDoubleSubmitOnUpdate', async ({ page }) => {
    let putCount = 0;

    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      putDelayMs: 1200,
      onPut: () => {
        putCount += 1;
      },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await clickEditOrSave(page);
    await clickEditOrSave(page);

    await expect.poll(() => putCount).toBe(2);
  });

  test('SC06-IT-018 shouldDisplayValuesConsistentlyAcrossFields', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page);

    await openSettingScreen(page);

    await expectSettingValues(page, {
      passwordExpiryDays: '90',
      passwordReissueUrlValidHours: '24',
      passwordRetryCount: '3',
      noticeDisplayCount: '10',
    });
  });

  test('SC06-IT-019 shouldNotPersistUnsavedChangesAfterReload', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page);

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await fillSettingValues(page, { passwordExpiryDays: '777' });
    await expect(settingInput(page, 'passwordExpiryDays')).toHaveValue('777');

    await page.reload();

    await expect(settingInput(page, 'passwordExpiryDays')).toHaveValue('90');
  });

  test('SC06-IT-020 shouldAcceptMinimumBoundaryValueOnUI', async ({ page }) => {
    let payload: SystemSettingUpdateRequest | null = null;

    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      onPut: (req) => {
        payload = req;
      },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await fillSettingValues(page, { passwordRetryCount: '1' });
    await clickEditOrSave(page);

    await expect.poll(() => payload?.numberOfRetries).toBe(1);
  });

  test('SC06-IT-021 shouldRejectDuplicateSubmitPayloadOnUI', async ({ page }) => {
    let putCount = 0;

    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      onPut: () => {
        putCount += 1;
      },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);
    await clickEditOrSave(page);

    await expect.poll(() => putCount).toBe(1);
  });

  test('SC06-IT-022 shouldShowUpdatedValuesAfterSaveWithoutManualRefresh', async ({ page }) => {
    await mockSettingSession(page, true);
    await mockSettingApis(page, {
      putBody: buildSystemSettingsBody([
        { settingID: 'PASSWORD_VALID_DAYS', value: '200' },
        { settingID: 'PASSWORD_REISSUE_URL_EXPIRATION', value: '12' },
        { settingID: 'NUMBER_OF_RETRIES', value: '4' },
        { settingID: 'NUMBER_OF_NOTICES', value: '15' },
      ]),
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);
    await clickEditOrSave(page);

    await expectSettingValues(page, {
      passwordExpiryDays: '200',
      passwordReissueUrlValidHours: '12',
      passwordRetryCount: '4',
      noticeDisplayCount: '15',
    });
  });

  test('SC06-IT-023 shouldHandleNetworkTimeoutOnSaveGracefully', async ({ page }) => {
    await mockSettingSession(page, true);

    await mockSettingApis(page, {
      putStatus: 504,
      putDelayMs: 2500,
      putBody: { message: 'timeout' },
    });

    await openSettingScreen(page);
    await clickEditOrSave(page);

    await fillSettingValues(page, { passwordExpiryDays: '111' });
    await clickEditOrSave(page);

    await expectSnackbarVisible(page);
    await expect(settingInput(page, 'passwordExpiryDays')).toHaveValue('111');
  });

  test('SC06-IT-024 shouldControlEditabilityByRoleCorrectly', async ({ page }) => {
    await mockSettingSession(page, false);
    await mockSettingApis(page);

    await openSettingScreen(page);
    await expect(page.locator('button.MuiButton-root')).toHaveCount(0);

    await page.unroute(/\/api\/auth\/status(\?.*)?$/);
    await mockSettingSession(page, true);

    await page.reload();

    await expect(page.locator('button.MuiButton-root')).toHaveCount(1);
  });
});
