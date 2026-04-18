import * as real from "./real/adminService";
import * as mock from "./mock/adminService";
import { selectHook } from "./serviceSelector";

export const useAdminUsers = selectHook(real.useAdminUsers, mock.useAdminUsers);
export const useAdminUserPermissionsList = selectHook(
  real.useAdminUserPermissionsList,
  mock.useAdminUserPermissionsList
);
export const useDeleteUser = selectHook(real.useDeleteUser, mock.useDeleteUser);
export const useUpdateUserPermissions = selectHook(
  real.useUpdateUserPermissions,
  mock.useUpdateUserPermissions
);
