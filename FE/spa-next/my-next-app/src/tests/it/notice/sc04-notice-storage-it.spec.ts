import { expect, test } from '@playwright/test';
import {
  clickDialogPrimaryButton,
  fillNoticeForm,
  getModal,
  mockNoticeList,
  openCreatePopup,
  openTop,
} from './notice.helpers';
import { mockAuthStatus, mockSystemSettings } from '../auth/auth.helpers';

test.describe('SC04 Notice Storage IT', () => {
  test('SC04-IT-008 shouldStoreFilesInConfiguredDirectoryWhenNoticeDirectoryIsSpecified', async ({
    page,
  }) => {
    let uploadedDocId = '';
    let createPayload: any = null;

    await mockAuthStatus(page, {
      success: true,
      data: {
        authenticated: true,
        rolePermissions: {
          SYSTEM_SETTINGS: 3,
          NOTICE: 3,
          USER: 2,
          ROLE: 2,
          MANUAL: 2,
        },
        user: { userId: 'validuser', givenName: 'Valid', surname: 'User' },
      },
    });

    await mockSystemSettings(page, {
      success: true,
      data: {
        data: {
          systemSettings: [
            { settingID: 'PASSWORD_VALID_DAYS', value: '90' },
            { settingID: 'PASSWORD_REISSUE_URL_EXPIRATION', value: '24' },
            { settingID: 'NUMBER_OF_RETRIES', value: '3' },
            { settingID: 'NUMBER_OF_NOTICES', value: '10' },
            { settingID: 'NOTICE_DIRECTORY', value: '/data/notice' },
          ],
        },
      },
    });

    await mockNoticeList(page, []);

    await page.route(/\/api\/notice\/upload(\?.*)?$/, async (route) => {
      uploadedDocId =
        'data/notice/12345678-1234-1234-1234-123456789abc-notice-configured-directory-test.pdf';

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { docIds: [uploadedDocId] } }),
      });
    });

    await page.route(/\/api\/notice\/create(\?.*)?$/, async (route) => {
      createPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { noticeId: 4001 } }),
      });
    });

    await openTop(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'notice-configured-directory-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy-pdf'),
    });

    await expect.poll(() => uploadedDocId).not.toBe('');
    await expect(dialog.getByText('notice-configured-directory-test.pdf')).toBeVisible();

    await fillNoticeForm(page, {
      title: 'Notice Directory Storage Test',
      startDate: '2026/04/01',
      endDate: '2026/12/31',
      content: 'Directory should be applied by configured setting.',
    });

    await clickDialogPrimaryButton(page);

    await expect.poll(() => createPayload).toBeTruthy();
    expect(createPayload.docIds).toEqual([uploadedDocId]);
  });
});

