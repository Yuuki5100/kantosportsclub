import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { useFetch, useApiMutation, useDeleteById } from "@/hooks/useApi";
import { CacheStrategies } from "@/config/cacheStrategies";
import type { AdminUser, UpdateUserPermissionsRequest } from "@/types/admin";

// 管理者専用：ユーザー一覧取得用フック
export const useAdminUsers = () => {
  return useFetch<AdminUser[]>(
    "adminUsers",
    API_ENDPOINTS.ADMIN.GET_USERS,
    undefined,
    CacheStrategies.READ_ONLY
  );
};

// 管理画面向け権限一覧（ユーザー一覧）
export const useAdminUserPermissionsList = () => {
  return useFetch<{ data: { id: number; username: string; rolePermissions: Record<string, number> }[]; success: boolean }>(
    "userList",
    API_ENDPOINTS.USER.LIST,
    { limit: 180000 },
    {
      useCache: true,
    }
  );
};

// ユーザー削除
export const useDeleteUser = () => {
  return useDeleteById(API_ENDPOINTS.ADMIN.DELETE_USER);
};

// 権限更新
export const useUpdateUserPermissions = () => {
  return useApiMutation<null, UpdateUserPermissionsRequest>(
    "put",
    API_ENDPOINTS.ADMIN.UPDATE_PERMISSIONS
  );
};
