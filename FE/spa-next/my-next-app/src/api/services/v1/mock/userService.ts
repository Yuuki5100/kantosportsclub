import { useQuery, useMutation } from "@tanstack/react-query";
import { CacheStrategies } from "@/config/cacheStrategies";
import type {
  userType,
  UserCreateRequest,
  UserDeleteRequest,
  UserDetailData,
  UserListData,
  UserListQuery,
  UserUpdateRequest,
} from "@/types/userType";
import type { UserListItem } from "@/types/userType";
import {
  mockCreateUser,
  mockDeleteUser,
  mockGetUserDetail,
  mockGetUserList,
  mockGetUserProfile,
  mockRestoreUser,
  mockUnlockUser,
  mockUpdateUser,
  mockUpdateUserProfile,
} from "@/mocks/user/handlers";

const buildQueryKey = (key: string, params?: unknown, useCache: boolean = false) =>
  useCache ? [key, params] : [key, params, Date.now()];

const toUserType = (item: UserListItem): userType => ({
  id: item.userId,
  name: `${item.surname} ${item.givenName}`.trim(),
  email: item.email,
  role: item.roleName.includes("管理者") ? "admin" : "user",
});

export const useUserList = () => {
  return useQuery<userType[], Error>({
    queryKey: buildQueryKey("userList"),
    queryFn: async () => {
      const result = await mockGetUserList({ pageNumber: 1, pagesize: 50 });
      return result.users.map(toUserType);
    },
    staleTime: CacheStrategies.READ_ONLY.staleTime,
    gcTime: CacheStrategies.READ_ONLY.gcTime,
  });
};

export const useUserProfile = () => {
  return useQuery<userType, Error>({
    queryKey: buildQueryKey("userProfile"),
    queryFn: async () => (await mockGetUserProfile()) as unknown as userType,
  });
};

export const useUserDetail = (userId: string | undefined) => {
  return useQuery<userType, Error>({
    queryKey: buildQueryKey("userDetail", userId),
    queryFn: async () => (await mockGetUserDetail(userId ?? "")) as unknown as userType,
    enabled: !!userId,
    staleTime: 1000 * 60 * 1,
  });
};

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: async (_data: { name: string; email: string }) =>
      (await mockUpdateUserProfile()) as unknown as { name: string; email: string },
  });
};

export const createUserApi = async (request: UserCreateRequest): Promise<void> => {
  return mockCreateUser(request);
};

export const getUserDetailApi = async (userId: string): Promise<UserDetailData> => {
  return mockGetUserDetail(userId);
};

export const updateUserApi = async (userId: string, request: UserUpdateRequest): Promise<void> => {
  return mockUpdateUser(userId, request);
};

export const deleteUserApi = async (userId: string, request: UserDeleteRequest): Promise<void> => {
  return mockDeleteUser(userId, request);
};

export const restoreUserApi = async (userId: string): Promise<void> => {
  return mockRestoreUser(userId);
};

export const unlockUserApi = async (lockedUserId: string): Promise<void> => {
  return mockUnlockUser(lockedUserId);
};

export const getUserListApi = async (query: UserListQuery): Promise<UserListData> => {
  return mockGetUserList(query);
};
