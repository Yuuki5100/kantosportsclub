import { expect, test } from "@playwright/test";
import {
  clickDialogPrimaryButton,
  clickSearch,
  getCreateButtonNearTable,
  getModal,
  manualDetail1001,
  manualListBase,
  mockAuthenticatedShell,
  mockManualCreate,
  mockManualDownload,
  mockManualDetail,
  mockManualList,
  mockManualUpload,
  mockReadOnlyManualShell,
  openCreatePopup,
  openFirstDetail,
  openManualList,
} from "./manual.helpers";
import { expectOnLogin } from "../auth/auth.helpers";

test.describe("SC05 ManualList IT", () => {
  test("SC05-IT-001 shouldOpenDetailPopupFromList", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockManualList(page, [manualListBase[0]]);
    await mockManualDetail(page, manualDetail1001);

    await openManualList(page);
    await openFirstDetail(page);

    const dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).toHaveValue("Manual Alpha");
    await expect(dialog.locator('textarea[name="description"]')).toHaveValue(
      "Manual detail contents"
    );
  });

  test("SC05-IT-002 shouldDisplayCorrectLabelsOnListScreen", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);

    await openManualList(page);

    await expect(page.locator('input[name="searchTitle"]')).toBeVisible();
    await expect(page.locator('input[type="radio"][name="targetFilter"]')).toHaveCount(3);
    await expect(page.locator('input[type="radio"][name="deletedFilter"]')).toHaveCount(2);
    await expect(getCreateButtonNearTable(page)).toBeVisible();
    await expect(page.locator("thead th")).toHaveCount(7);
  });

  test("SC05-IT-003 shouldDisplayColumnsInCorrectOrder", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);

    await openManualList(page);

    const headers = page.locator("thead th");
    await expect(headers).toHaveCount(7);
    await expect(headers.nth(0)).toContainText("#");

    const firstRowCells = page.locator("tbody tr").first().locator("td");
    await expect(firstRowCells).toHaveCount(7);
    await expect(firstRowCells.nth(0)).toContainText("1");
    await expect(firstRowCells.nth(1)).toContainText("Manual Alpha");
  });

  test("SC05-IT-004 shouldApplyDefaultDisplayState", async ({ page }) => {
    let firstListUrl = "";

    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase], manualListBase.length, 200, {
      capture: (req) => {
        if (!firstListUrl) firstListUrl = req.url();
      },
    });

    await openManualList(page);

    await expect.poll(() => firstListUrl).not.toBe("");
    const url = new URL(firstListUrl);
    expect(url.searchParams.get("target")).toBe("0");
    expect(url.searchParams.get("isdeleted")).toBe("1");
    expect(url.searchParams.get("pageNumber")).toBe("1");
    expect(url.searchParams.get("pagesize")).toBe("50");
  });

  test("SC05-IT-005 shouldFilterListWhenSearchExecuted", async ({ page }) => {
    let listCalls = 0;
    const capturedUrls: string[] = [];

    await mockAuthenticatedShell(page);
    await page.route(/\/api\/manual\/list(\?.*)?$/, async (route) => {
      listCalls += 1;
      const requestUrl = route.request().url();
      capturedUrls.push(requestUrl);
      const search = new URL(requestUrl).searchParams.get("titleName");
      const manuals = search === "Alpha" ? [manualListBase[0]] : [...manualListBase];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { manuals, total: manuals.length } }),
      });
    });

    await openManualList(page);
    await page.locator('input[name="searchTitle"]').fill("Alpha");
    await clickSearch(page);

    await expect.poll(() => listCalls).toBeGreaterThan(1);
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.locator("tbody tr").first().locator("td").nth(1)).toContainText(
      "Manual Alpha"
    );
    expect(capturedUrls.some((u) => new URL(u).searchParams.get("titleName") === "Alpha")).toBe(
      true
    );
  });

  test("SC05-IT-006 shouldChangePageWhenPagingOperated", async ({ page }) => {
    const page1 = Array.from({ length: 50 }, (_, i) => ({
      manualId: 2000 + i,
      manualTitle: `Manual P1-${i + 1}`,
      generalUser: true,
      systemUser: false,
      updatedBy: "Admin",
      updatedAt: "2026/02/16 10:00:00",
    }));
    const page2 = [
      {
        manualId: 3001,
        manualTitle: "Manual Page2-1",
        generalUser: true,
        systemUser: false,
        updatedBy: "Admin",
        updatedAt: "2026/02/16 10:00:00",
      },
    ];

    await mockAuthenticatedShell(page);
    await page.route(/\/api\/manual\/list(\?.*)?$/, async (route) => {
      const requestUrl = route.request().url();
      const pageNumber = new URL(requestUrl).searchParams.get("pageNumber");
      const manuals = pageNumber === "2" ? page2 : page1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { manuals, total: 51 } }),
      });
    });

    await openManualList(page);
    await expect(page.locator("tbody tr")).toHaveCount(50);

    await page.getByRole("button", { name: "2" }).first().click();

    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.getByText("Manual Page2-1")).toBeVisible();
  });

  test("SC05-IT-007 shouldShowEmptyStateWhenNoDataFound", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockManualList(page, []);

    await openManualList(page);
    await page.locator('input[name="searchTitle"]').fill("NoMatchKeyword");
    await clickSearch(page);

    await expect(page.locator("tbody tr")).toHaveCount(0);
  });

  test("SC05-IT-008 shouldNotShowNewButtonForReadOnlyUser", async ({ page }) => {
    await mockReadOnlyManualShell(page);
    await mockManualList(page, [...manualListBase]);

    await openManualList(page);

    await expect(getCreateButtonNearTable(page)).toHaveCount(0);
    await expect(page.locator("tbody tr")).toHaveCount(2);
  });

  test("SC05-IT-009 shouldRenderReadOnlyModeCorrectly", async ({ page }) => {
    await mockReadOnlyManualShell(page);
    await mockManualList(page, [manualListBase[0]]);
    await mockManualDetail(page, manualDetail1001);

    await openManualList(page);
    await openFirstDetail(page);

    const dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).not.toBeEditable();
    await expect(dialog.locator('textarea[name="description"]')).not.toBeEditable();
    await expect(dialog.locator('button:not([aria-label="close"])')).toHaveCount(0);
  });

  test("SC05-IT-010 shouldDisableUpdateOperationForReadOnlyUser", async ({ page }) => {
    let updateCalls = 0;

    await mockReadOnlyManualShell(page);
    await mockManualList(page, [manualListBase[0]]);
    await mockManualDetail(page, manualDetail1001);
    await page.route(/\/api\/manual\/\d+(\?.*)?$/, async (route) => {
      if (route.request().method() === "PUT") {
        updateCalls += 1;
      }
      await route.fallback();
    });

    await openManualList(page);
    await openFirstDetail(page);

    const dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).not.toBeEditable();
    await expect(dialog.locator('textarea[name="description"]')).not.toBeEditable();
    expect(updateCalls).toBe(0);
  });

  test("SC05-IT-011 shouldUploadFileWhenSelected", async ({ page }) => {
    let uploadCalls = 0;

    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);
    await mockManualUpload(page, 200, { success: true, data: { docIds: ["guide.pdf"] } }, {
      capture: () => {
        uploadCalls += 1;
      },
    });

    await openManualList(page);
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

  test("SC05-IT-012 shouldDownloadFileWhenClicked", async ({ page }) => {
    let downloadCalls = 0;

    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);
    await mockManualDetail(page, { ...manualDetail1001, docIds: ["guide.pdf"] });
    await mockManualDownload(page, 200, {
      capture: () => {
        downloadCalls += 1;
      },
    });

    await openManualList(page);
    await openFirstDetail(page);

    await getModal(page).getByText("guide.pdf").click();
    await expect.poll(() => downloadCalls).toBe(1);
  });

  test("SC05-IT-013 shouldShowErrorMessageWhenApiFails", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await page.route(/\/api\/manual\/list(\?.*)?$/, async (route) => {
      await route.abort("internetdisconnected");
    });

    await openManualList(page);

    await expect(page.locator("tbody tr")).toHaveCount(0);
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC05-IT-014 shouldHandleUnexpectedErrorSafely", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);
    await page.route(/\/api\/manual\/\d+(\?.*)?$/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "unexpected server error" }),
      });
    });

    await openManualList(page);
    await page.locator("tbody tr").first().locator("button").last().click();

    const dialog = getModal(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('input[name="title"]')).toHaveValue("");
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC05-IT-015 shouldRedirectToLoginWhenSessionExpired", async ({ page }) => {
    let listCalls = 0;

    await mockAuthenticatedShell(page);
    await page.route(/\/api\/manual\/list(\?.*)?$/, async (route) => {
      listCalls += 1;
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "unauthorized" }),
      });
    });

    await page.goto("/manual/list");
    await expectOnLogin(page);
    await expect.poll(() => listCalls).toBe(1);
  });

  test("SC05-IT-016 shouldReflectCreatedManualInList", async ({ page }) => {
    let createCalls = 0;
    let listCalls = 0;

    await mockAuthenticatedShell(page);
    await page.route(/\/api\/manual\/list(\?.*)?$/, async (route) => {
      listCalls += 1;
      const manuals =
        listCalls === 1
          ? [...manualListBase]
          : [
              {
                manualId: 3001,
                manualTitle: "Manual Create Test",
                generalUser: true,
                systemUser: false,
                updatedBy: "Admin",
                updatedAt: "2026/02/16 12:00:00",
              },
              ...manualListBase,
            ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { manuals, total: manuals.length } }),
      });
    });
    await mockManualCreate(page, 200, { success: true, data: { manualId: 3001 } }, {
      capture: () => {
        createCalls += 1;
      },
    });

    await openManualList(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    await dialog.locator('input[name="title"]').fill("Manual Create Test");
    await dialog.locator('textarea[name="description"]').fill("Created by test");
    await clickDialogPrimaryButton(page);

    await expect.poll(() => createCalls).toBe(1);
    await expect(page.getByText("Manual Create Test")).toBeVisible();
  });

  test("SC05-IT-017 shouldReflectUpdatedManualInList", async ({ page }) => {
    let updateCalls = 0;
    let listCalls = 0;

    await mockAuthenticatedShell(page);
    await page.route(/\/api\/manual\/list(\?.*)?$/, async (route) => {
      listCalls += 1;
      const manuals =
        listCalls === 1
          ? [...manualListBase]
          : [{ ...manualListBase[0], manualTitle: "Manual Updated Title" }, manualListBase[1]];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { manuals, total: manuals.length } }),
      });
    });
    await mockManualDetail(page, manualDetail1001);
    await page.route(/\/api\/manual\/\d+(\?.*)?$/, async (route) => {
      if (route.request().method() !== "PUT") {
        await route.fallback();
        return;
      }
      updateCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await openManualList(page);
    await openFirstDetail(page);

    const dialog = getModal(page);
    await clickDialogPrimaryButton(page);
    await dialog.locator('input[name="title"]').fill("Manual Updated Title");
    await clickDialogPrimaryButton(page);

    await expect.poll(() => updateCalls).toBe(1);
    await expect(page.getByText("Manual Updated Title")).toBeVisible();
  });

  test("SC05-IT-018 shouldNotPersistChangesWhenClosedWithoutUpdate", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);
    await mockManualDetail(page, manualDetail1001);

    await openManualList(page);
    await openFirstDetail(page);

    let dialog = getModal(page);
    await clickDialogPrimaryButton(page);
    await dialog.locator('input[name="title"]').fill("Unsaved Title");
    await dialog.locator('textarea[name="description"]').fill("Unsaved description");
    await dialog.locator('button[aria-label="close"]').last().click();

    await openFirstDetail(page);
    dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).toHaveValue("Manual Alpha");
    await expect(dialog.locator('textarea[name="description"]')).toHaveValue(
      "Manual detail contents"
    );
  });

  test("SC05-IT-019 shouldDisableUpdateForDeletedManual", async ({ page }) => {
    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);
    await mockManualDetail(page, { ...manualDetail1001, deletedFlag: true });

    await openManualList(page);
    await openFirstDetail(page);

    const dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).not.toBeEditable();
    await expect(dialog.locator('textarea[name="description"]')).not.toBeEditable();
    await expect(dialog.locator('button:not([aria-label="close"])')).toHaveCount(0);
  });

  test("SC05-IT-020 shouldShowValidationWhenTitleEmpty", async ({ page }) => {
    let updateCalls = 0;

    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);
    await mockManualDetail(page, manualDetail1001);
    await page.route(/\/api\/manual\/\d+(\?.*)?$/, async (route) => {
      if (route.request().method() === "PUT") {
        updateCalls += 1;
      }
      await route.fallback();
    });

    await openManualList(page);
    await openFirstDetail(page);

    const dialog = getModal(page);
    await clickDialogPrimaryButton(page);
    await dialog.locator('input[name="title"]').fill("");
    await clickDialogPrimaryButton(page);

    expect(updateCalls).toBe(0);
    await expect(dialog.locator('input[name="title"]')).toBeEditable();
    await expect(dialog.locator('input[name="title"]')).toHaveValue("");
  });

  test("SC05-IT-021 shouldValidateFileNameLength", async ({ page }) => {
    let uploadCalls = 0;

    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);
    await mockManualUpload(page, 400, { message: "filename too long" }, {
      capture: () => {
        uploadCalls += 1;
      },
    });

    await openManualList(page);
    await openCreatePopup(page);

    const longName = `${"a".repeat(260)}.pdf`;
    const dialog = getModal(page);
    await dialog.locator('input[type="file"]').setInputFiles({
      name: longName,
      mimeType: "application/pdf",
      buffer: Buffer.from("pdf"),
    });

    await expect.poll(() => uploadCalls).toBe(1);
    await expect(dialog.getByText(longName)).toHaveCount(0);
  });

  test("SC05-IT-022 shouldRejectInvalidFileType", async ({ page }) => {
    let uploadCalls = 0;

    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);
    await mockManualUpload(page, 400, { message: "unsupported type" }, {
      capture: () => {
        uploadCalls += 1;
      },
    });

    await openManualList(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    await dialog.locator('input[type="file"]').setInputFiles({
      name: "invalid.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("exe"),
    });

    await expect.poll(() => uploadCalls).toBe(1);
    await expect(dialog.getByText("invalid.exe")).toHaveCount(0);
  });

  test("SC05-IT-023 shouldRejectOversizeFile", async ({ page }) => {
    let uploadCalls = 0;

    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);
    await mockManualUpload(page, 200, { success: true, data: { docIds: ["big.pdf"] } }, {
      capture: () => {
        uploadCalls += 1;
      },
    });

    await openManualList(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    await dialog.locator('input[type="file"]').setInputFiles({
      name: "big.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.alloc(6 * 1024 * 1024, "a"),
    });

    expect(uploadCalls).toBe(0);
    await expect(dialog.getByText("big.pdf")).toHaveCount(0);
  });

  test("SC05-IT-024 shouldPreventDoubleSubmission", async ({ page }) => {
    let createCalls = 0;

    await mockAuthenticatedShell(page);
    await mockManualList(page, [...manualListBase]);
    await mockManualCreate(page, 200, { success: true, data: { manualId: 3002 } }, {
      capture: () => {
        createCalls += 1;
      },
    });

    await openManualList(page);
    await openCreatePopup(page);

    const dialog = getModal(page);
    await dialog.locator('input[name="title"]').fill("Manual Double Click");
    await dialog.locator('textarea[name="description"]').fill("submit once");
    await dialog.locator('button:not([aria-label="close"])').last().dblclick();

    await expect.poll(() => createCalls).toBe(1);
  });

  test("SC05-IT-FE-025 shouldNotUpdateWhenSwitchingToAnotherManualWithoutSave", async ({
    page,
  }) => {
    let updateCalls = 0;
    const manualA = { ...manualDetail1001, manualId: 1001, manualTitle: "Manual A" };
    const manualB = { ...manualDetail1001, manualId: 1002, manualTitle: "Manual B" };

    await mockAuthenticatedShell(page);
    await mockManualList(page, [
      { ...manualListBase[0], manualId: 1001, manualTitle: "Manual A" },
      { ...manualListBase[1], manualId: 1002, manualTitle: "Manual B" },
    ]);
    await page.route(/\/api\/manual\/\d+(\?.*)?$/, async (route) => {
      const request = route.request();
      if (request.method() === "PUT") {
        updateCalls += 1;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: {} }),
        });
        return;
      }

      const id = Number(request.url().split("/api/manual/")[1].split("?")[0]);
      const manual = id === 1002 ? manualB : manualA;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { manual } }),
      });
    });

    await openManualList(page);

    const firstRow = page.locator("tbody tr").nth(0);
    await firstRow.locator("button").last().click();
    let dialog = getModal(page);
    await clickDialogPrimaryButton(page);
    await dialog.locator('input[name="title"]').fill("Manual A Unsaved");
    await dialog.locator('button[aria-label="close"]').last().click();

    const secondRow = page.locator("tbody tr").nth(1);
    await secondRow.locator("button").last().click();
    dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).toHaveValue("Manual B");
    await dialog.locator('button[aria-label="close"]').last().click();

    await firstRow.locator("button").last().click();
    dialog = getModal(page);
    await expect(dialog.locator('input[name="title"]')).toHaveValue("Manual A");
    expect(updateCalls).toBe(0);
  });
});

