import { useMutation, useQuery } from "@tanstack/react-query";
import type { UpdateUserPermissionsRequest } from "@/types/admin";
import {
  mockDeleteAdminUser,
  mockGetAdminUsers,
  mockUpdateUserPermissions,
} from "@/mocks/admin/handlers";
import { mockGetUserListForUseFetch } from "@/mocks/user/handlers";

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["adminUsers", Date.now()],
    queryFn: () => mockGetAdminUsers(),
  });
};

export const useAdminUserPermissionsList = () => {
  return useQuery({
    queryKey: ["userList", Date.now()],
    queryFn: async () => {
      const result = await mockGetUserListForUseFetch();

      return {
        success: result.success,
        data: result.data.map((user) => ({
          id: Number(user.id),
          username: user.username,
          rolePermissions: user.rolePermissions as Record<string, number>,
        })),
      };
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      await mockDeleteAdminUser(userId);
    },
  });
};

export const useUpdateUserPermissions = () => {
  return useMutation({
    mutationFn: async (data: UpdateUserPermissionsRequest) => mockUpdateUserPermissions(data),
  });
};
