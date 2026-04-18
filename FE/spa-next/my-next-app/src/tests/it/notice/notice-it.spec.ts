import { expect, test } from "@playwright/test";
import {
  expectOnLogin,
  mockAuthStatus,
  mockSystemSettings,
  systemSettingsSuccessBody,
} from "../auth/auth.helpers";
import {
  clickDialogPrimaryButton,
  detail1001,
  fillNoticeForm,
  getModal,
  mockAuthenticatedShell,
  mockNoticeCreate,
  mockNoticeDetail,
  mockNoticeDownload,
  mockNoticeList,
  mockNoticeUpdate,
  mockNoticeUpload,
  noticeListBase,
  openCreatePopup,
  openFirstDetail,
  openTop,
} from "./notice.helpers";

test.describe("SC03 Notice IT", () => {
  test("SC03-IT-001 shouldDisplayNoticeListOnInitialLoad", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);

    await openTop(page);

    await expect(page.getByText("Active Notice 1001")).toBeVisible();
    await expect(page.getByText("Active Notice 1002")).toBeVisible();
    await expect(page.getByText("Expired Notice 1003")).toHaveCount(0);
  });

  test("SC03-IT-002 shouldMatchListWithApiResponseCountAndOrder", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [noticeListBase[1], noticeListBase[0]]);

    await openTop(page);

    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0).locator("td").nth(1)).toContainText("Active Notice 1002");
    await expect(rows.nth(1).locator("td").nth(1)).toContainText("Active Notice 1001");
  });

  test("SC03-IT-003 shouldCallNoticeListApiOnceOnInitialLoad", async ({ page }) => {
    let listCalls = 0;
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase], 200, {
      capture: () => {
        listCalls += 1;
      },
    });

    await openTop(page);
    await expect.poll(() => listCalls).toBe(1);
  });

  test("SC03-IT-004 shouldShowNoDataMessageWhenListIsEmpty", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);

    await openTop(page);

    await expect(page.locator("tbody tr")).toHaveCount(0);
  });

  test("SC03-IT-005 shouldShowErrorWhenListApiReturns500", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [], 500, { capture: () => {} });

    await openTop(page);

    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC03-IT-006 shouldRedirectToLoginWhenListApiReturns401", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [], 401);
    await page.goto("/");
    await expectOnLogin(page);
  });

  test("SC03-IT-007 shouldHandleNetworkOfflineOnListWithoutCrash", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await page.route(/\/api\/notice\/list(\?.*)?$/, async (route) => {
      await route.abort("internetdisconnected");
    });

    await openTop(page);

    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC03-IT-008 shouldOpenNoticeDetailFromList", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, detail1001);

    await openTop(page);
    await openFirstDetail(page);

    await expect(getModal(page).locator('input[name="title"]')).toHaveValue(
      "Active Notice 1001"
    );
    await expect(getModal(page)).toContainText("Notice detail contents");
  });

  test("SC03-IT-009 shouldCallNoticeDetailApiWithCorrectNoticeId", async ({ page }) => {
    let detailUrl = "";
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, detail1001, 200, {
      capture: (req) => {
        detailUrl = req.url();
      },
    });

    await openTop(page);
    await openFirstDetail(page);

    expect(detailUrl).toContain("notice_id=1001");
  });

  test("SC03-IT-010 shouldShowNotFoundWhenOpeningNonExistingNoticeDetail", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, detail1001, 404);

    await openTop(page);
    await page.locator("tbody tr").first().locator("button").first().click();

    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC03-IT-011 shouldMatchNoticeListLabelsWithSpec", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);

    await openTop(page);

    const headers = page.locator("thead th");
    await expect(headers).toHaveCount(6);
    await expect(headers.nth(0)).toContainText("#");
  });

  test("SC03-IT-012 shouldMatchNoticeListLayoutOrderWithSpec", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);

    await openTop(page);

    const firstRowCells = page.locator("tbody tr").first().locator("td");
    await expect(firstRowCells).toHaveCount(6);
    await expect(firstRowCells.nth(0)).toContainText("1");
    await expect(firstRowCells.nth(1)).toContainText("Active Notice 1001");
  });

  test("SC03-IT-013 shouldMatchNoticeDetailLabelsWithSpec", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, detail1001);

    await openTop(page);
    await openFirstDetail(page);

    const dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).toBeVisible();
    await expect(dialog.locator('textarea[name="content"]')).toBeVisible();
    await expect(dialog.locator("button").last()).toBeVisible();
  });

  test("SC03-IT-014 shouldHideCreateNoticeForUsersWithoutEditPermission", async ({ page }) => {
    await mockAuthStatus(page, {
      success: true,
      data: {
        authenticated: true,
        rolePermissions: {},
        user: { userId: "readonly", givenName: "Read", surname: "Only" },
      },
    });
    await mockSystemSettings(page, systemSettingsSuccessBody);
    await mockNoticeList(page, [...noticeListBase]);

    await openTop(page);
    const createButton = page
      .locator("table")
      .first()
      .locator('xpath=preceding::button[contains(@class,"MuiButton-root")][1]');
    await expect(createButton).toHaveCount(0);
  });

  test("SC03-IT-015 shouldAllowCreateNoticeForUsersWithEditPermission", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);

    await openTop(page);
    const createButton = page
      .locator("table")
      .first()
      .locator('xpath=preceding::button[contains(@class,"MuiButton-root")][1]');
    await expect(createButton).toBeVisible();
  });

  test("SC03-IT-016 shouldOpenCreateNoticePopupInCreateMode", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);

    await openTop(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).toHaveValue("");
    await expect(dialog.locator('textarea[name="content"]')).toHaveValue("");
    await expect(dialog.locator("button").last()).toBeVisible();
  });

  test("SC03-IT-017 shouldValidateRequiredFieldsOnCreate", async ({ page }) => {
    let createCalls = 0;
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);
    await mockNoticeCreate(page, 200, { success: true, data: { noticeId: 3001 } }, {
      capture: () => {
        createCalls += 1;
      },
    });

    await openTop(page);
    await openCreatePopup(page);
    await clickDialogPrimaryButton(page);

    expect(createCalls).toBe(0);
    await expect(getModal(page)).toBeVisible();
  });

  test("SC03-IT-018 shouldPreventInvalidPeriodEndBeforeStartOnCreate", async ({ page }) => {
    let createCalls = 0;
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);
    await mockNoticeCreate(page, 400, { message: "invalid period" }, {
      capture: () => {
        createCalls += 1;
      },
    });

    await openTop(page);
    await openCreatePopup(page);
    await fillNoticeForm(page, {
      title: "Invalid Period",
      startDate: "2026/02/10",
      endDate: "2026/02/09",
      content: "invalid range",
    });
    await clickDialogPrimaryButton(page);

    expect(createCalls).toBe(1);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(getModal(page)).toBeVisible();
  });

  test("SC03-IT-019 shouldCreateNoticeWithValidDataAndReflectInList", async ({ page }) => {
    let createCalls = 0;
    let listCalls = 0;
    await mockAuthenticatedShell(page);

    await page.route(/\/api\/notice\/list(\?.*)?$/, async (route) => {
      listCalls += 1;
      const list =
        listCalls === 1
          ? [...noticeListBase]
          : [
              {
                noticeId: 3001,
                noticeTitle: "Notice Create Test",
                startDate: "2026/02/13",
                endDate: "2026/02/20",
                creatorUserName: "Admin",
                createdAt: "2026-02-13T00:00:00.000Z",
              },
              ...noticeListBase,
            ];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { noticeList: list } }),
      });
    });

    await mockNoticeCreate(page, 200, { success: true, data: { noticeId: 3001 } }, {
      capture: () => {
        createCalls += 1;
      },
    });

    await openTop(page);
    await openCreatePopup(page);
    await fillNoticeForm(page, {
      title: "Notice Create Test",
      startDate: "2026/02/13",
      endDate: "2026/02/20",
      content: "Created by test",
    });
    await clickDialogPrimaryButton(page);

    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(page.getByText("Notice Create Test")).toBeVisible();
    expect(createCalls).toBe(1);
  });

  test("SC03-IT-020 shouldCallCreateApiOnlyWhenSaveClicked", async ({ page }) => {
    let createCalls = 0;
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);
    await mockNoticeCreate(page, 200, { success: true, data: { noticeId: 3001 } }, {
      capture: () => {
        createCalls += 1;
      },
    });

    await openTop(page);
    await openCreatePopup(page);
    await fillNoticeForm(page, {
      title: "Notice Create Test",
      startDate: "2026/02/13",
      endDate: "2026/02/20",
      content: "Created by test",
    });

    expect(createCalls).toBe(0);
    await clickDialogPrimaryButton(page);
    await expect.poll(() => createCalls).toBe(1);
  });

  test("SC03-IT-021 shouldShowErrorWhenCreateApiFailsAndKeepInputs", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);
    await mockNoticeCreate(page, 500, { message: "create failed" });

    await openTop(page);
    await openCreatePopup(page);
    await fillNoticeForm(page, {
      title: "Create Fail Case",
      startDate: "2026/02/13",
      endDate: "2026/02/20",
      content: "keep me",
    });
    await clickDialogPrimaryButton(page);

    const dialog = getModal(page);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('input[name="title"]')).toHaveValue("Create Fail Case");
    await expect(dialog.locator('textarea[name="content"]')).toHaveValue("keep me");
  });

  test("SC03-IT-022 shouldKeepDetailReadOnlyWhenUserLacksUpdatePermission", async ({ page }) => {
    await mockAuthStatus(page, {
      success: true,
      data: {
        authenticated: true,
        rolePermissions: {},
        user: { userId: "readonly", givenName: "Read", surname: "Only" },
      },
    });
    await mockSystemSettings(page, systemSettingsSuccessBody);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, detail1001);

    await openTop(page);
    await openFirstDetail(page);

    const dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).not.toBeEditable();
    await expect(dialog.locator('textarea[name="content"]')).not.toBeEditable();
  });

  test("SC03-IT-023 shouldOpenEditModeFromDetailWhenUserHasUpdatePermission", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, detail1001);

    await openTop(page);
    await openFirstDetail(page);
    await clickDialogPrimaryButton(page);

    const dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).toBeEditable();
  });

  test("SC03-IT-024 shouldUpdateNoticeAndReflectInDetailAndList", async ({ page }) => {
    let updateCalls = 0;
    let listCalls = 0;

    await mockAuthenticatedShell(page);
    await page.route(/\/api\/notice\/list(\?.*)?$/, async (route) => {
      listCalls += 1;
      const list =
        listCalls === 1
          ? [...noticeListBase]
          : [{ ...noticeListBase[0], noticeTitle: "Updated Title" }, noticeListBase[1]];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { noticeList: list } }),
      });
    });

    await mockNoticeDetail(page, detail1001);
    await mockNoticeUpdate(page, 200, { success: true, data: {} }, {
      capture: () => {
        updateCalls += 1;
      },
    });

    await openTop(page);
    await openFirstDetail(page);

    const dialog = getModal(page);
    await clickDialogPrimaryButton(page);
    await dialog.locator('input[name="title"]').fill("Updated Title");
    await clickDialogPrimaryButton(page);

    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(page.getByText("Updated Title")).toBeVisible();
    expect(updateCalls).toBe(1);
  });

  test("SC03-IT-025 shouldValidateRequiredFieldsOnUpdate", async ({ page }) => {
    let updateCalls = 0;

    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, detail1001);
    await mockNoticeUpdate(page, 200, { success: true, data: {} }, {
      capture: () => {
        updateCalls += 1;
      },
    });

    await openTop(page);
    await openFirstDetail(page);
    await clickDialogPrimaryButton(page);

    const dialog = getModal(page);
    await dialog.locator('input[name="title"]').fill("");
    await clickDialogPrimaryButton(page);

    expect(updateCalls).toBe(0);
    await expect(dialog).toBeVisible();
  });

  test("SC03-IT-026 shouldShowErrorWhenUpdateApiFailsAndStayInEdit", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, detail1001);
    await mockNoticeUpdate(page, 500, { message: "update failed" });

    await openTop(page);
    await openFirstDetail(page);
    await clickDialogPrimaryButton(page);

    const dialog = getModal(page);
    await dialog.locator('textarea[name="content"]').fill("updated content");
    await clickDialogPrimaryButton(page);

    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('textarea[name="content"]')).toHaveValue("updated content");
  });

  test("SC03-IT-027 shouldUploadOneAttachmentAndDisplayInAttachmentList", async ({ page }) => {
    let uploadCalls = 0;

    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);
    await mockNoticeUpload(page, 200, { success: true, data: { docIds: ["guide.pdf"] } }, {
      capture: () => {
        uploadCalls += 1;
      },
    });

    await openTop(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("dummy-pdf"),
    });

    await expect.poll(() => uploadCalls).toBe(1);
    await expect(dialog.getByText("test.pdf")).toBeVisible();
  });

  test("SC03-IT-028 shouldLimitAttachmentsToMaxThree", async ({ page }) => {
    let uploadCalls = 0;

    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);
    await page.route(/\/api\/notice\/upload(\?.*)?$/, async (route) => {
      uploadCalls += 1;
      if (uploadCalls <= 3) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: { docIds: [`file-${uploadCalls}`] } }),
        });
        return;
      }
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "max 3 files allowed" }),
      });
    });

    await openTop(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    const fileInput = dialog.locator('input[type="file"]');

    await fileInput.setInputFiles({ name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from("a") });
    await expect.poll(() => uploadCalls).toBe(1);
    await expect(dialog.getByText("a.pdf")).toBeVisible();

    await fileInput.setInputFiles({ name: "b.pdf", mimeType: "application/pdf", buffer: Buffer.from("b") });
    await expect.poll(() => uploadCalls).toBe(2);
    await expect(dialog.getByText("b.pdf")).toBeVisible();

    await fileInput.setInputFiles({ name: "c.pdf", mimeType: "application/pdf", buffer: Buffer.from("c") });
    await expect.poll(() => uploadCalls).toBe(3);
    await expect(dialog.getByText("c.pdf")).toBeVisible();

    await fileInput.setInputFiles({ name: "d.pdf", mimeType: "application/pdf", buffer: Buffer.from("d") });
    await expect.poll(() => uploadCalls).toBe(4);

    await expect(dialog.getByText("a.pdf")).toBeVisible();
    await expect(dialog.getByText("b.pdf")).toBeVisible();
    await expect(dialog.getByText("c.pdf")).toBeVisible();
    await expect(dialog.getByText("d.pdf")).toHaveCount(0);
    expect(uploadCalls).toBe(4);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
  });

  test("SC03-IT-029 shouldRejectInvalidAttachmentType", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);
    await mockNoticeUpload(page, 400, { message: "unsupported type" });

    await openTop(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("exe"),
    });

    await expect(page.getByTestId("snackbar-container")).toBeVisible();
  });

  test("SC03-IT-030 shouldRejectAttachmentOver5MB", async ({ page }) => {
    let uploadCalls = 0;

    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);
    await mockNoticeUpload(page, 200, { success: true, data: { docIds: ["big.pdf"] } }, {
      capture: () => {
        uploadCalls += 1;
      },
    });

    await openTop(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "big.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.alloc(6 * 1024 * 1024, "a"),
    });

    expect(uploadCalls).toBe(0);
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
  });

  test("SC03-IT-031 shouldClearAttachmentRowAndAllowReupload", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, []);
    await mockNoticeUpload(page, 200, { success: true, data: { docIds: ["file-id"] } });

    await openTop(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles({ name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from("a") });
    await expect(dialog.getByText("a.pdf")).toBeVisible();

    const fileRow = dialog.getByText("a.pdf").locator("xpath=ancestor::div[1]");
    await fileRow.locator("button").first().click();
    await expect(dialog.getByText("a.pdf")).toHaveCount(0);

    await fileInput.setInputFiles({ name: "b.pdf", mimeType: "application/pdf", buffer: Buffer.from("b") });
    await expect(dialog.getByText("b.pdf")).toBeVisible();
  });

  test("SC03-IT-032 shouldDownloadAttachmentFromDetail", async ({ page }) => {
    let downloadCalls = 0;
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, {
      ...detail1001,
      docIds: ["guide.pdf"],
    });
    await mockNoticeDownload(page, 200, {
      capture: () => {
        downloadCalls += 1;
      },
    });

    await openTop(page);
    await openFirstDetail(page);

    await getModal(page).getByText("guide.pdf").click();
    await expect.poll(() => downloadCalls).toBe(1);
  });

  test("SC03-IT-033 shouldShowErrorWhenDownloadFails", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, {
      ...detail1001,
      docIds: ["guide.pdf"],
    });
    await mockNoticeDownload(page, 500);

    await openTop(page);
    await openFirstDetail(page);

    await getModal(page).getByText("guide.pdf").click();
    await expect(page.getByTestId("snackbar-container")).toBeVisible();
  });

  test("SC03-IT-034 shouldRedirectToLoginWhenNoticeListReturns401", async ({ page }) => {
    let listCalls = 0;
    let refreshCalls = 0;

    await mockAuthenticatedShell(page);
    await page.route(/\/api\/notice\/list(\?.*)?$/, async (route) => {
      listCalls += 1;
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "unauthorized" }),
      });
    });
    await page.route(/\/auth\/refresh(\?.*)?$/, async (route) => {
      refreshCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/");
    await expectOnLogin(page);
    await expect.poll(() => listCalls).toBe(1);
    expect(refreshCalls).toBe(0);
  });

  test("SC03-IT-035 shouldNotRetryNoticeListAfterUnauthorizedResponse", async ({ page }) => {
    let listCalls = 0;
    let refreshCalls = 0;

    await mockAuthenticatedShell(page);
    await page.route(/\/api\/notice\/list(\?.*)?$/, async (route) => {
      listCalls += 1;
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "unauthorized" }),
      });
    });
    await page.route(/\/auth\/refresh(\?.*)?$/, async (route) => {
      refreshCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/");
    await expectOnLogin(page);
    await expect.poll(() => listCalls).toBe(1);
    expect(refreshCalls).toBe(0);
  });

  test("SC03-IT-036 shouldShowNoticesRegardlessOfStartDateAsLongAsNotExpired", async ({ page }) => {
    await mockAuthenticatedShell(page);
    // Backend-integrated behavior: backend returns only non-expired notices.
    await mockNoticeList(page, [
      {
        noticeId: 1010,
        noticeTitle: "Future Start Still Visible",
        startDate: "2099/01/01",
        endDate: "2099/12/31",
        creatorUserName: "Admin",
        createdAt: "2026-02-13T00:00:00.000Z",
      },
    ]);

    await openTop(page);

    await expect(page.getByText("Future Start Still Visible")).toBeVisible();
    await expect(page.getByText("Expired Hidden")).toHaveCount(0);
  });

  test("SC03-IT-037 shouldRespectNoticeDisplayLimitSetting", async ({ page }) => {
    await mockAuthenticatedShell(page);
    // Backend-integrated behavior: API response is already capped by system limit.
    const notices = Array.from({ length: 10 }, (_, i) => ({
      noticeId: 2000 + i,
      noticeTitle: `Limit Test ${i + 1}`,
      startDate: "2026/02/01",
      endDate: "2099/12/31",
      creatorUserName: "Admin",
      createdAt: "2026-02-13T00:00:00.000Z",
    }));
    await mockNoticeList(page, notices);

    await openTop(page);

    await expect(page.locator("tbody tr")).toHaveCount(10);
  });
});
