import { expect, test } from '@playwright/test';
import { expectOnLogin } from './auth.helpers';

const statusBody = (authenticated: boolean) => ({
  success: true,
  data: {
    authenticated,
    rolePermissions: authenticated
      ? {
          SYSTEM_SETTINGS: 3,
          NOTICE: 3,
          USER: 3,
          ROLE: 3,
          MANUAL: 3,
        }
      : {},
    user: authenticated ? { userId: 'validuser', givenName: 'Valid', surname: 'User' } : undefined,
  },
});

const systemBody = {
  success: true,
  data: {
    data: {
      systemSettings: [
        { settingID: 'PASSWORD_VALID_DAYS', value: '90' },
        { settingID: 'PASSWORD_REISSUE_URL_EXPIRATION', value: '24' },
        { settingID: 'NUMBER_OF_RETRIES', value: '3' },
        { settingID: 'NUMBER_OF_NOTICES', value: '10' },
      ],
    },
  },
};

test.describe('SC03 Auth IT', () => {
  test('SC03-IT-013 shouldReflectLogoutAcrossTabsWhenUserLogsOutInAnotherTab', async ({
    context,
  }) => {
    let authenticated = true;

    await context.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(statusBody(authenticated)),
      });
    });

    await context.route(/\/api\/system(\?.*)?$/, async (route) => {
      if (!authenticated) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'unauthorized' }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(systemBody),
      });
    });

    await context.route(/\/auth\/logout(\?.*)?$/, async (route) => {
      authenticated = false;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    const tabA = await context.newPage();
    const tabB = await context.newPage();

    await tabA.goto('/settings');
    await expect(tabA).toHaveURL(/\/settings/);

    await tabB.goto('/settings');
    await expect(tabB).toHaveURL(/\/settings/);

    await tabB.getByTestId('logout-button').click();
    await expectOnLogin(tabB);

    await tabA.reload();
    await expectOnLogin(tabA);

    await tabA.close();
    await tabB.close();
  });

  test('SC03-IT-048 shouldSendCorrectAccountCreationEmailContent', async ({ page }) => {
    let putUrl = '';
    let putPayload: any = null;

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(statusBody(true)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(systemBody),
      });
    });

    await page.route(/\/mail-templates(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              templateName: 'ACCOUNT_CREATION',
              locale: 'ja',
              subject: 'アカウント作成案内',
              body: '初期本文',
            },
            {
              templateName: 'PASSWORD_RESET',
              locale: 'ja',
              subject: 'パスワード再設定案内',
              body: '再設定本文',
            },
          ],
        }),
      });
    });

    await page.route(/\/api\/mail-templates\/ACCOUNT_CREATION(\?.*)?$/, async (route) => {
      putUrl = route.request().url();
      putPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/mailTemplete');

    await page.locator('input[name="mailsSubject"]').fill('Account Created - Welcome');
    await page.locator('input[name="mailBody"]').fill('Your account has been created successfully.');
    await page.getByRole('button', { name: '保存' }).click();

    await expect.poll(() => putUrl).toContain('/api/mail-templates/ACCOUNT_CREATION');
    expect(putPayload).toEqual({
      templateName: 'ACCOUNT_CREATION',
      locale: 'ja',
      subject: 'Account Created - Welcome',
      body: 'Your account has been created successfully.',
    });
  });

  test('SC03-IT-048 shouldSendCorrectPasswordResetEmailContent', async ({ page }) => {
    let putUrl = '';
    let putPayload: any = null;

    await page.route(/\/auth\/status(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(statusBody(true)),
      });
    });

    await page.route(/\/api\/system(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(systemBody),
      });
    });

    await page.route(/\/mail-templates(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              templateName: 'ACCOUNT_CREATION',
              locale: 'ja',
              subject: 'アカウント作成案内',
              body: '初期本文',
            },
            {
              templateName: 'PASSWORD_RESET',
              locale: 'ja',
              subject: 'パスワード再設定案内',
              body: '再設定本文',
            },
          ],
        }),
      });
    });

    await page.route(/\/api\/mail-templates\/PASSWORD_RESET(\?.*)?$/, async (route) => {
      putUrl = route.request().url();
      putPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/mailTemplete');

    await page.locator('div[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'PASSWORD_RESET' }).click();

    await page.locator('input[name="mailsSubject"]').fill('Password Reset Instructions');
    await page
      .locator('input[name="mailBody"]')
      .fill('Click the link below to reset your password.');
    await page.getByRole('button', { name: '保存' }).click();

    await expect.poll(() => putUrl).toContain('/api/mail-templates/PASSWORD_RESET');
    expect(putPayload).toEqual({
      templateName: 'PASSWORD_RESET',
      locale: 'ja',
      subject: 'Password Reset Instructions',
      body: 'Click the link below to reset your password.',
    });
  });
});

