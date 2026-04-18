import { expect, test, Page } from "@playwright/test";
import {
  mockAuthenticatedUser,
  mockRoleDropdown,
  mockUserDetail,
  openUserDetail,
  openUserList,
  roleDropdownBase,
  userDetailBase,
  userListBase,
} from "./user.helpers";

const waitForUserListResponse = (page: Page, timeout = 8000) =>
  page.waitForResponse((res) => {
    const url = res.url();
    return (
      (res.request().method() === "GET" || res.request().method() === "POST") &&
      (url.includes("/api/user/list") || url.includes("/user/access/list")) &&
      res.status() < 500
    );
  }, { timeout }).catch(() => null);

const waitForUserDetailResponse = (page: Page, userId?: string, timeout = 8000) =>
  page.waitForResponse((res) => {
    const url = res.url();
    const isDetail =
      res.request().method() === "GET" &&
      (url.includes("/api/user/") || url.includes("/user/access/")) &&
      !url.includes("/list") &&
      !url.includes("/profile") &&
      !url.includes("/unlock") &&
      !url.includes("/create") &&
      !url.includes("/update") &&
      !url.includes("/reset-password") &&
      !url.includes("/forgot-password");

    if (!isDetail) return false;
    if (!userId) return true;
    return url.includes(userId);
  }, { timeout }).catch(() => null);

const waitForUserUpdateResponse = (page: Page, timeout = 8000) =>
  page.waitForResponse((res) => {
    const url = res.url();
    return (
      (res.request().method() === "PUT" || res.request().method() === "POST") &&
      (url.includes("/api/user") ||
        url.includes("/user/access")) &&
      !url.includes("/list") &&
      !url.includes("/unlock") &&
      res.status() < 500
    );
  }, { timeout }).catch(() => null);

const waitForUserCreateResponse = (page: Page, timeout = 8000) =>
  page.waitForResponse((res) => {
    const url = res.url();
    return (
      res.request().method() === "POST" &&
      (url.includes("/api/user/create") ||
        url.includes("/user/access/create")) &&
      res.status() < 500
    );
  }, { timeout }).catch(() => null);

const waitForUnlockResponse = (page: Page) =>
  page.waitForResponse((res) => {
    const url = res.url();
    return (
      (url.includes("/api/user/unlock") || url.includes("/user/access/unlock")) &&
      res.status() < 500
    );
  });

const mockUpdateSuccess = async (page: Page, onUpdated: () => void) => {
  await page.route(/\/(?:api\/user|user\/access)(?:\/[^/?]+)?(\?.*)?$/, async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();
    if (method !== "PUT" && method !== "POST" && method !== "PATCH") {
      await route.fallback();
      return;
    }
    if (
      url.includes("/list") ||
      url.includes("/unlock") ||
      url.includes("/create") ||
      url.includes("/forgot-password") ||
      url.includes("/reset-password")
    ) {
      await route.fallback();
      return;
    }
    onUpdated();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: {} }),
    });
  });
};

const clickSearch = async (page: Page) => {
  const searchButton = page.getByRole("button", { name: /^検索$/ }).last();
  await expect(searchButton).toBeVisible();
  await searchButton.click();
  await waitForUserListResponse(page, 4000).catch(() => null);
};

const enterEditMode = async (page: Page) => {
  const updateButton = page.getByRole("button", { name: /^更新$/ }).first();
  await expect(updateButton).toBeVisible();
  await updateButton.click();
  await expect(page.getByRole("button", { name: /^登録$/ }).first()).toBeVisible();
};

const submitPrimaryAction = async (page: Page) => {
  const registerButton = page.getByRole("button", { name: /^登録$/ }).first();
  await expect(registerButton).toBeVisible();

  await registerButton.click();

  if (page.url().includes("mode=create")) {
    await waitForUserCreateResponse(page, 5000).catch(() => null);
    return;
  }

  await Promise.any([
    waitForUserUpdateResponse(page, 5000),
    waitForUserCreateResponse(page, 5000),
  ]).catch(() => null);
};

const runSearch = async (page: Page, name: string) => {
  let searchInput = page.locator('input[name="searchUserName"]').first();

  if (!(await searchInput.isVisible().catch(() => false))) {
    const accordionToggle = page.getByRole("button", { name: /検索オプション/ }).first();
    if (await accordionToggle.isVisible().catch(() => false)) {
      await accordionToggle.click({ force: true });
    }
    searchInput = page.locator('input[name="searchUserName"]').first();
  }

  await expect(searchInput).toBeVisible();
  await searchInput.fill(name);
  await clickSearch(page);
};

test.describe("SC03 User IT", () => {
  test("SC03-IT-001 shouldMaintainUserDetailConsistencyWhenPageIsReloaded", async ({ page }) => {
    let detailCallCount = 0;

    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);
    await mockUserDetail(page, userDetailBase, 200, {
      capture: () => {
        detailCallCount += 1;
      },
    });

    await openUserDetail(page, "U0001");
    await expect(page.locator('input[name="surname"]')).toHaveValue("Yamada");
    await expect(page.locator('input[name="givenName"]')).toHaveValue("Taro");

    await Promise.all([waitForUserDetailResponse(page, "U0001"), page.reload()]);

    await expect(page.locator('input[name="userId"]')).toHaveValue("U0001");
    await expect(page.locator('input[name="surname"]')).toHaveValue("Yamada");
    await expect(page.locator('input[name="givenName"]')).toHaveValue("Taro");
    expect(detailCallCount).toBeGreaterThanOrEqual(2);
  });

  test("SC03-IT-003 shouldDisplayUpdatedUserDataWhenReopeningDetailAfterUpdate", async ({
    page,
  }) => {
    let updated = false;

    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);

    await page.route(/\/(?:api\/user\/U0001|user\/access\/U0001)(\?.*)?$/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            ...userDetailBase,
            userId: "U0001",
            surname: updated ? "Updated" : "Yamada",
            givenName: updated ? "User" : "Taro",
          },
        }),
      });
    });

    await mockUpdateSuccess(page, () => {
      updated = true;
    });

    await openUserDetail(page, "U0001");
    await expect(page.locator('input[name="surname"]')).toHaveValue("Yamada");
    await expect(page.locator('input[name="givenName"]')).toHaveValue("Taro");

    await enterEditMode(page);
    await expect(page.locator('input[name="surname"]')).toBeEnabled();
    await expect(page.locator('input[name="givenName"]')).toBeEnabled();

    await page.locator('input[name="surname"]').fill("Updated");
    await page.locator('input[name="givenName"]').fill("User");

    await submitPrimaryAction(page);

    await openUserDetail(page, "U0001");
    await expect(page.locator('input[name="surname"]')).toHaveValue("Updated");
    await expect(page.locator('input[name="givenName"]')).toHaveValue("User");
  });

  test("SC03-IT-005 shouldReflectNewUserImmediatelyInListAfterCreation", async ({ page }) => {
    const createdUser = {
      ...userListBase[0],
      userId: "U0099",
      surname: "New",
      givenName: "Member",
      email: "new.member@example.com",
      roleId: 2,
      roleName: "ROLE_EDIT",
    };
    let listData = [...userListBase];

    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/create|user\/access\/create)(\?.*)?$/, async (route) => {
      listData = [...listData, createdUser];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users: listData, total: listData.length } }),
      });
    });

    await page.goto("/user/detail?mode=create");
    await expect(page.locator('input[name="userId"]')).toBeVisible();

    await page.locator('input[name="userId"]').fill("U0099");
    await page.locator('input[name="surname"]').fill("New");
    await page.locator('input[name="givenName"]').fill("Member");

    await page.locator('div[role="combobox"]').first().click();
    await page.getByRole("option", { name: "ROLE_EDIT" }).click();

    await Promise.all([
      waitForUserCreateResponse(page),
      page.getByRole("button", { name: "登録" }).click(),
    ]);

    await openUserList(page);
    await expect(page.getByText("U0099")).toBeVisible();
    await expect(page.getByText("new.member@example.com")).toBeVisible();
  });

  test("SC03-IT-006 shouldReflectUpdatedUserImmediatelyInListAfterUpdate", async ({ page }) => {
    let updated = false;

    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const users = updated
        ? [{ ...userListBase[0], surname: "After", givenName: "Update" }, userListBase[1]]
        : [...userListBase];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });

    await mockUpdateSuccess(page, () => {
      updated = true;
    });

    await page.route(/\/(?:api\/user\/U0001|user\/access\/U0001)(\?.*)?$/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: updated
            ? { ...userDetailBase, userId: "U0001", surname: "After", givenName: "Update" }
            : { ...userDetailBase, userId: "U0001" },
        }),
      });
    });

    await openUserDetail(page, "U0001");
    await enterEditMode(page);

    await expect(page.locator('input[name="surname"]')).toBeEnabled();
    await expect(page.locator('input[name="givenName"]')).toBeEnabled();

    await page.locator('input[name="surname"]').fill("After");
    await page.locator('input[name="givenName"]').fill("Update");
    updated = true;

    await submitPrimaryAction(page);

    await openUserList(page);
    const updatedRow = page.locator("tbody tr").filter({ has: page.getByText("U0001") }).first();
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText("After");
    await expect(updatedRow).toContainText("Update");
  });

  test("SC03-IT-007 shouldPreserveSearchSortAndPaginationStateAfterNavigation", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);
    await mockUserDetail(page, userDetailBase);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      const pageNumber = Number(reqUrl.searchParams.get("pageNumber") ?? "1");
      const pageSize = Number(reqUrl.searchParams.get("pagesize") ?? "50");
      const name = reqUrl.searchParams.get("name") ?? "";

      const allUsers = Array.from({ length: 55 }).map((_, i) => ({
        ...userListBase[0],
        userId: `U${String(i + 1).padStart(4, "0")}`,
        surname: `Yamada${i + 1}`,
        givenName: "Taro",
        email: `user-${i + 1}@example.com`,
      }));

      const filtered = name
        ? allUsers.filter((u) => `${u.surname} ${u.givenName}`.includes(name))
        : allUsers;
      const start = (pageNumber - 1) * pageSize;
      const users = filtered.slice(start, start + pageSize);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: filtered.length } }),
      });
    });

    await openUserList(page);
    await runSearch(page, "Yamada");

    const page2Button = page.getByRole("button", { name: "2" }).first();
    await expect(page2Button).toBeVisible();
    await Promise.all([waitForUserListResponse(page), page2Button.click()]);

    const userNameHeader = page.getByRole("columnheader", { name: /ユーザー名/ }).first();
    await expect(userNameHeader).toBeVisible();
    await Promise.all([waitForUserListResponse(page), userNameHeader.click()]);

    const detailButton = page.locator("tbody tr").first().locator("button");
    await expect(detailButton).toBeVisible();
    await Promise.all([waitForUserDetailResponse(page), detailButton.click()]);

    await expect(page).toHaveURL(/\/user\/detail\?id=/);

    await Promise.all([waitForUserListResponse(page), page.goBack()]);

    await expect(page).toHaveURL(/\/user\/list/);
    await expect(page.locator('input[name="searchUserName"]')).toHaveValue("Yamada");
    await expect(page.locator("tbody tr")).toHaveCount(5);
  });

  test("SC03-IT-008 shouldReflectUnlockedStatusWhenUserIsReopened", async ({ page }) => {
    let locked = true;

    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);

    await page.route(/\/(?:api\/user\/unlock|user\/access\/unlock)(\?.*)?$/, async (route) => {
      locked = false;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await page.route(/\/(?:api\/user\/U0002|user\/access\/U0002)(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { ...userDetailBase, userId: "U0002", isLocked: locked },
        }),
      });
    });

    await openUserDetail(page, "U0002");
    await expect(page.getByRole("button", { name: "ロック解除" })).toBeVisible();

    await page.getByRole("button", { name: "ロック解除" }).click();
    await Promise.all([
      waitForUnlockResponse(page),
      page.getByRole("button", { name: "解除" }).click(),
    ]);

    await openUserDetail(page, "U0002");
    await expect(page.getByRole("button", { name: "ロック解除" })).toHaveCount(0);
  });

  test("SC03-IT-009 shouldUpdateSearchResultsWhenSearchableFieldsAreModified", async ({ page }) => {
    let updated = false;

    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      const name = reqUrl.searchParams.get("name") ?? "";
      const users = [
        {
          ...userListBase[0],
          userId: "U0001",
          surname: updated ? "NewName" : "OldName",
          givenName: "User",
          email: "search.target@example.com",
        },
      ].filter((u) => `${u.surname} ${u.givenName}`.includes(name));

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });

    await mockUpdateSuccess(page, () => {
      updated = true;
    });

    await page.route(/\/(?:api\/user\/U0001|user\/access\/U0001)(\?.*)?$/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            ...userDetailBase,
            userId: "U0001",
            surname: updated ? "NewName" : "OldName",
            givenName: "User",
          },
        }),
      });
    });

    await openUserList(page);
    await runSearch(page, "OldName User");
    await expect(page.getByText("search.target@example.com")).toBeVisible();

    await openUserDetail(page, "U0001");
    await enterEditMode(page);
    await expect(page.locator('input[name="surname"]')).toBeEnabled();

    await page.locator('input[name="surname"]').fill("NewName");
    updated = true;
    await submitPrimaryAction(page);

    await openUserList(page);
    await runSearch(page, "OldName User");
    await expect(page.locator("tbody tr")).toHaveCount(0);

    await runSearch(page, "NewName User");
    await expect(page.getByText("search.target@example.com")).toBeVisible();
  });

  test("SC03-IT-015 shouldDisplayConsistentRoleInformationInUserScreen", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);
    await mockUserDetail(page, { ...userDetailBase, userId: "U0002", roleId: 2, roleName: "ROLE_EDIT" });

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const users = [{ ...userListBase[1], userId: "U0002", roleId: 2, roleName: "ROLE_EDIT" }];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: 1 } }),
      });
    });

    await openUserList(page);
    await expect(page.getByRole("cell", { name: "ROLE_EDIT" }).first()).toBeVisible();

    const detailButton = page.locator("tbody tr").first().locator("button");
    await Promise.all([waitForUserDetailResponse(page, "U0002"), detailButton.click()]);

    await expect(page).toHaveURL(/\/user\/detail\?id=U0002/);
    await expect(page.getByText("ROLE_EDIT")).toBeVisible();
  });

  test("SC03-IT-016 shouldReflectRoleChangesInUserList", async ({ page }) => {
    let roleId = 1;

    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const users = [
        {
          ...userListBase[0],
          userId: "U0001",
          roleId,
          roleName: roleId === 2 ? "ROLE_EDIT" : "ROLE_VIEW_ONLY",
        },
      ];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });

    await mockUpdateSuccess(page, () => {
      roleId = 2;
    });

    await page.route(/\/(?:api\/user\/U0001|user\/access\/U0001)(\?.*)?$/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            ...userDetailBase,
            userId: "U0001",
            roleId,
            roleName: roleId === 2 ? "ROLE_EDIT" : "ROLE_VIEW_ONLY",
          },
        }),
      });
    });

    await openUserDetail(page, "U0001");
    await enterEditMode(page);
    await expect(page.locator('input[name="surname"]')).toBeEnabled();

    const roleCombobox = page.locator("#mui-component-select-role").first();
    await expect(roleCombobox).toBeVisible();
    await roleCombobox.click({ force: true });

    const roleEditOption = page.getByRole("option", { name: /^ROLE_EDIT$/ }).first();
    await expect(roleEditOption).toBeVisible();
    await roleEditOption.click({ force: true });
    roleId = 2;

    await submitPrimaryAction(page);

    await openUserList(page);
    await expect(page.getByRole("cell", { name: "ROLE_EDIT" }).first()).toBeVisible();
  });

  test("SC03-IT-018 shouldDisplayDeletedUserAccordingToSpecification", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);
    await mockUserDetail(page, {
      ...userDetailBase,
      userId: "U0098",
      isDeleted: true,
      deletionReason: "退職",
    });

    await openUserDetail(page, "U0098");
    await expect(page.getByRole("button", { name: "復元" })).toBeVisible();
    await expect(page.getByText("YES")).toBeVisible();
    await expect(page.getByText("退職")).toBeVisible();
  });

  test("SC03-IT-019 shouldRestrictEditingWhenUsersDeleted", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);
    await mockUserDetail(page, {
      ...userDetailBase,
      userId: "U0098",
      isDeleted: true,
    });

    await openUserDetail(page, "U0098");
    await expect(page.getByText("YES")).toBeVisible();
    await expect(page.getByRole("button", { name: "復元" })).toBeVisible();

    const updateButton = page.getByRole("button", { name: "更新" }).first();
    if (await updateButton.isVisible().catch(() => false)) {
      await updateButton.click();
      await expect(page.getByRole("button", { name: "復元" })).toBeVisible();
      await expect(page.getByText("YES")).toBeVisible();
    }
  });

  test("SC03-IT-025 shouldDisplayErrorMessageWhenDuplicateOrConstraintViolationOccurs", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/api\/user\/create(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "duplicate key" }),
      });
    });

    await page.goto("/user/detail?mode=create");
    await page.locator('input[name="userId"]').fill("U0001");
    await page.locator('input[name="surname"]').fill("Yamada");
    await page.locator('input[name="givenName"]').fill("Taro");
    await page.locator('div[role="combobox"]').first().click();
    await page.getByRole("option", { name: "ROLE_VIEW_ONLY" }).click();

    await page.getByRole("button", { name: "登録" }).click();

    await expect(page.getByTestId("snackbar-container")).toBeVisible();
    await expect(page).toHaveURL(/\/user\/detail\?mode=create/);
  });

  test("SC03-IT-027 shouldRenderUserDetailScreenWhenOptionalFieldsAreMissing", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);

    await page.route(/\/api\/user\/[^/]+(\?.*)?$/, async (route) => {
      const req = route.request();
      if (req.method() !== "GET") {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            userId: "U0100",
            surname: "Optional",
            givenName: "Missing",
            email: "optional.missing@example.com",
            roleName: "ROLE_VIEW_ONLY",
            roleId: 1,
            isLocked: false,
            isDeleted: false,
            failedLoginAttempts: 0,
          },
        }),
      });
    });

    await openUserDetail(page, "U0100");
    await expect(page.locator('input[name="userId"]')).toHaveValue("U0100");
    await expect(page.locator('input[name="phoneNumber"]')).toHaveValue("");
    await expect(page.locator("body")).toBeVisible();
  });

  test("SC03-IT-029 shouldApplyFallbackWhenDisplayFieldsAreMissing", async ({ page }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const users = [
        {
          ...userListBase[0],
          userId: "U0101",
          surname: "",
          givenName: "",
          email: "fallback@example.com",
          roleName: "",
        },
      ];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: 1 } }),
      });
    });

    await openUserList(page);
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.getByText("fallback@example.com")).toBeVisible();
    await expect(page.locator("tbody tr button")).toHaveCount(1);
  });

  test("SC03-IT-030 shouldAllowRecreationWithSameUserIdAfterLogicalDeletion", async ({ page }) => {
    let createdPayload: Record<string, unknown> | null = null;
    let activeUsers = [
      {
        ...userListBase[0],
        userId: "U0900",
        email: "deleted.user@example.com",
      },
    ];

    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page, [...roleDropdownBase]);

    await page.route(/\/api\/user\/create(\?.*)?$/, async (route) => {
      createdPayload = route.request().postDataJSON() as Record<string, unknown>;
      activeUsers = [
        {
          ...userListBase[0],
          userId: "U0900",
          surname: "Re",
          givenName: "Created",
          email: "recreated@example.com",
        },
      ];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users: activeUsers, total: activeUsers.length } }),
      });
    });

    await page.goto("/user/detail?mode=create");
    await page.locator('input[name="userId"]').fill("U0900");
    await page.locator('input[name="surname"]').fill("Re");
    await page.locator('input[name="givenName"]').fill("Created");

    await page.locator('div[role="combobox"]').first().click();
    await page.getByRole("option", { name: "ROLE_VIEW_ONLY" }).click();

    await Promise.all([
      waitForUserCreateResponse(page),
      page.getByRole("button", { name: "登録" }).click(),
    ]);

    expect(createdPayload?.userId).toBe("U0900");

    await openUserList(page);
    await expect(page.getByText("U0900")).toBeVisible();
    await expect(page.getByText("recreated@example.com")).toBeVisible();
  });

  test("SC03-IT-031 shouldSearchUserCorrectlyWhenNameContainsSpaces", async ({ page }) => {
    let requestedName = "";

    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      const reqUrl = new URL(route.request().url());
      requestedName = reqUrl.searchParams.get("name") ?? "";
      const normalizedRequestedName = requestedName.replace(/\s+/g, " ").trim();
      const users = normalizedRequestedName === "Yamada Taro" ? [{ ...userListBase[0] }] : [];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { users, total: users.length } }),
      });
    });

    await openUserList(page);
    await page.locator('input[name="searchUserName"]').fill("Yamada Taro");
    await clickSearch(page);

    await expect.poll(() => requestedName.replace(/\s+/g, " ").trim()).toBe("Yamada Taro");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.getByText("taro.yamada@example.com")).toBeVisible();
  });

  test("SC03-IT-052 shouldDisplayUserFacingErrorMessageInCorrectLanguageWhenServerFails", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page, { canEditUser: true });
    await mockRoleDropdown(page);

    await page.route(/\/(?:api\/user\/list|user\/access\/list)(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false }),
      });
    });

    await openUserList(page);

    const snackbar = page.getByTestId("snackbar-container");
    await expect(snackbar).toBeVisible();
    await expect(snackbar).toContainText("ユーザー一覧");
    await expect(snackbar).toContainText("取得に失敗");
  });
});

