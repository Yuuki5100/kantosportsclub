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
    queryFn: () => mockGetUserListForUseFetch(),
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
