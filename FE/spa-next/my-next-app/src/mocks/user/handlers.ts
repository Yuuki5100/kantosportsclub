import type {
  UserCreateRequest,
  UserDeleteRequest,
  UserDetailData,
  UserListData,
  UserListQuery,
  UserUpdateRequest,
} from "@/types/userType";
import { includesIgnoreCase } from "@/mocks/common/filters";
import { paginateList } from "@/mocks/common/pagination";
import { mockScenario, ensureScenario } from "@/mocks/common/response";
import {
  mockDeletedUserIds,
  mockUserDetailMap,
  mockUserListItems,
  mockUserProfile,
} from "./data";
import { getMessage, MessageCodes } from "@/message";

export const mockGetUserList = async (query?: UserListQuery): Promise<UserListData> => {
  ensureScenario(mockScenario.userListError, "ユーザー一覧の取得に失敗しました");
  const safeQuery: UserListQuery = {
    pageNumber: query?.pageNumber ?? 1,
    pagesize: query?.pagesize ?? 50,
    name: query?.name,
    roleId: query?.roleId,
    isLocked: query?.isLocked,
    isDeleted: query?.isDeleted,
  };
  let filtered = [...mockUserListItems];

  if (safeQuery.name) {
    filtered = filtered.filter((u) =>
      includesIgnoreCase(`${u.surname} ${u.givenName}`.trim(), safeQuery.name)
    );
  }

  if (safeQuery.roleId) {
    filtered = filtered.filter((u) => u.roleId === safeQuery.roleId);
  }

  if (typeof safeQuery.isLocked === "boolean") {
    filtered = filtered.filter((u) => u.isLocked === safeQuery.isLocked);
  }

  if (typeof safeQuery.isDeleted === "boolean") {
    filtered = filtered.filter((u) => mockDeletedUserIds.has(u.userId) === safeQuery.isDeleted);
  }

  const { items, total } = paginateList(filtered, safeQuery.pageNumber, safeQuery.pagesize);

  return {
    users: items,
    total,
  };
};

export const mockGetUserListForUseFetch = async (params?: Record<string, unknown>) => {
  ensureScenario(mockScenario.userListError, "ユーザー一覧の取得に失敗しました");
  return {
    data: mockUserListItems.map((u) => ({
      id: u.userId,
      username: `${u.surname} ${u.givenName}`.trim(),
      email: u.email,
      rolePermissions: {},
    })),
    success: true,
    error: null,
    users: mockUserListItems,
    total: mockUserListItems.length,
    params,
  };
};

export const mockGetUserDetail = async (userId: string): Promise<UserDetailData> => {
  const detail = mockUserDetailMap[userId];
  if (!detail) {
    throw new Error(getMessage(MessageCodes.NOT_FOUND));
  }
  return detail;
};

export const mockCreateUser = async (_request: UserCreateRequest): Promise<void> => {
  return;
};

export const mockUpdateUser = async (
  _userId: string,
  _request: UserUpdateRequest
): Promise<void> => {
  return;
};

export const mockDeleteUser = async (
  _userId: string,
  _request: UserDeleteRequest
): Promise<void> => {
  return;
};

export const mockRestoreUser = async (_userId: string): Promise<void> => {
  return;
};

export const mockUnlockUser = async (_userId: string): Promise<void> => {
  return;
};

export const mockGetUserProfile = async () => {
  return mockUserProfile;
};

export const mockUpdateUserProfile = async () => {
  return mockUserProfile;
};
