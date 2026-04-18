import { expect, test } from "@playwright/test";
import {
  clickDialogPrimaryButton,
  detail1001,
  fillNoticeForm,
  getModal,
  mockAuthenticatedShell,
  mockNoticeDetail,
  mockNoticeList,
  mockNoticeUpdate,
  noticeListBase,
  openFirstDetail,
  openTop,
} from "./notice.helpers";

test.describe("SC02 Notice Gap IT", () => {
  test("SC02-IT-064 shouldRetainNoticeInputsWhenNoticeUpdateFails", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockNoticeList(page, [...noticeListBase]);
    await mockNoticeDetail(page, detail1001);
    await mockNoticeUpdate(page, 500, { message: "update failed" });

    await openTop(page);
    await openFirstDetail(page);
    await clickDialogPrimaryButton(page);

    const dialog = getModal(page);
    await dialog.locator('input[name="title"]').fill("Notice Keep On Failure");
    await dialog.locator('textarea[name="content"]').fill("keep edited content");
    await fillNoticeForm(page, {
      title: "Notice Keep On Failure",
      startDate: "2026/02/13",
      endDate: "2026/02/20",
      content: "keep edited content",
    });
    await clickDialogPrimaryButton(page);

    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(dialog.locator('input[name="title"]')).toHaveValue("Notice Keep On Failure");
    await expect(dialog.locator('textarea[name="content"]')).toHaveValue("keep edited content");
    await expect(dialog).toBeVisible();
  });
});
