import * as real from "./real/roleService";
import * as mock from "./mock/roleService";
import { callWithMockFallback } from "./serviceSelector";

export const getRoleListApi = (query: Parameters<typeof real.getRoleListApi>[0]) =>
  callWithMockFallback(() => mock.getRoleListApi(query), () => real.getRoleListApi(query));

export const getRoleDropdownApi = () =>
  callWithMockFallback(() => mock.getRoleDropdownApi(), () => real.getRoleDropdownApi());

export const getRoleDetailApi = (roleId: Parameters<typeof real.getRoleDetailApi>[0]) =>
  callWithMockFallback(() => mock.getRoleDetailApi(roleId), () => real.getRoleDetailApi(roleId));

export const createRoleApi = (request: Parameters<typeof real.createRoleApi>[0]) =>
  callWithMockFallback(() => mock.createRoleApi(request), () => real.createRoleApi(request));

export const updateRoleApi = (
  roleId: Parameters<typeof real.updateRoleApi>[0],
  request: Parameters<typeof real.updateRoleApi>[1]
) => callWithMockFallback(() => mock.updateRoleApi(roleId, request), () => real.updateRoleApi(roleId, request));

export const deleteRoleApi = (
  roleId: Parameters<typeof real.deleteRoleApi>[0],
  request: Parameters<typeof real.deleteRoleApi>[1]
) => callWithMockFallback(() => mock.deleteRoleApi(roleId, request), () => real.deleteRoleApi(roleId, request));
