import type {
  RoleCreateRequest,
  RoleCreateResponse,
  RoleDeleteRequest,
  RoleDetailData,
  RoleDropdownData,
  RoleListData,
  RoleListQuery,
  RolePermissionModuleResponse,
  RoleUpdateRequest,
} from "@/types/role";
import {
  PERMISSION_MASTER,
  STATUS_LEVEL,
} from "@/types/role";
import { paginateList } from "@/mocks/common/pagination";
import { includesIgnoreCase } from "@/mocks/common/filters";
import { ensureScenario, mockScenario } from "@/mocks/common/response";
import { mockRoleListItems, mockRolePermissionLevels } from "./data";
import { getMessage, MessageCodes } from "@/message";

const buildPermissionDetails = (levels: Record<string, number>): RolePermissionModuleResponse[] => {
  const moduleMap = new Map<string, RolePermissionModuleResponse>();
  for (const master of PERMISSION_MASTER) {
    if (!moduleMap.has(master.module)) {
      moduleMap.set(master.module, { module: master.module, permissions: [] });
    }
    moduleMap.get(master.module)!.permissions.push({
      rolePermissionId: master.permissionId,
      permissionId: master.permissionId,
      permissionName: master.permissionName,
      statusLevelId: levels[master.permissionName] ?? STATUS_LEVEL.NONE,
      statusLevelName: "",
    });
  }
  return Array.from(moduleMap.values());
};

export const mockGetRoleList = async (query: RoleListQuery): Promise<RoleListData> => {
  ensureScenario(mockScenario.roleListError, "ロール一覧の取得に失敗しました");
  let filtered = [...mockRoleListItems];
  if (query.name) {
    filtered = filtered.filter((r) => includesIgnoreCase(r.roleName, query.name));
  }
  if (typeof query.isDeleted === "boolean") {
    if (query.isDeleted) {
      filtered = [];
    }
  }
  const { items, total } = paginateList(filtered, query.pageNumber, query.pagesize);
  return { roles: items, total };
};

export const mockGetRoleDropdown = async (): Promise<RoleDropdownData> => {
  return {
    roles: mockRoleListItems.map((r) => ({ roleId: r.roleId, roleName: r.roleName })),
  };
};

export const mockGetRoleDetail = async (roleId: number): Promise<RoleDetailData> => {
  const base = mockRoleListItems.find((r) => r.roleId === roleId);
  if (!base) {
    throw new Error(getMessage(MessageCodes.NOT_FOUND));
  }
  const levels = mockRolePermissionLevels[roleId] ?? mockRolePermissionLevels[1];
  return {
    roleId: base.roleId,
    roleName: base.roleName,
    isDeleted: false,
    deletionReason: null,
    description: base.description,
    creatorUserName: "System",
    creatorUserId: "system",
    createdAt: "2024-01-01 00:00:00",
    editorUserName: "System",
    editorUserId: "system",
    updatedAt: base.updatedAt,
    permissionDetails: buildPermissionDetails(levels),
  };
};

export const mockCreateRole = async (_request: RoleCreateRequest): Promise<RoleCreateResponse> => {
  return { roleId: 9999 };
};

export const mockUpdateRole = async (_roleId: number, _request: RoleUpdateRequest): Promise<void> => {
  return;
};

export const mockDeleteRole = async (_roleId: number, _request: RoleDeleteRequest): Promise<void> => {
  return;
};
