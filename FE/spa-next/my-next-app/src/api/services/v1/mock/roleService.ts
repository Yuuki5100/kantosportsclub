import type {
  RoleListQuery,
  RoleListData,
  RoleDropdownData,
  RoleDetailData,
  RoleCreateRequest,
  RoleCreateResponse,
  RoleUpdateRequest,
  RoleDeleteRequest,
} from "@/types/role";
import {
  mockCreateRole,
  mockDeleteRole,
  mockGetRoleDetail,
  mockGetRoleDropdown,
  mockGetRoleList,
  mockUpdateRole,
} from "@/mocks/role/handlers";

export const getRoleListApi = async (query: RoleListQuery): Promise<RoleListData> => {
  return mockGetRoleList(query);
};

export const getRoleDropdownApi = async (): Promise<RoleDropdownData> => {
  return mockGetRoleDropdown();
};

export const getRoleDetailApi = async (roleId: number): Promise<RoleDetailData> => {
  return mockGetRoleDetail(roleId);
};

export const createRoleApi = async (request: RoleCreateRequest): Promise<RoleCreateResponse> => {
  return mockCreateRole(request);
};

export const updateRoleApi = async (roleId: number, request: RoleUpdateRequest): Promise<void> => {
  return mockUpdateRole(roleId, request);
};

export const deleteRoleApi = async (roleId: number, request: RoleDeleteRequest): Promise<void> => {
  return mockDeleteRole(roleId, request);
};
