import { useFetch, useApiMutation } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import {
  userType,
  UserCreateRequest,
  UserUpdateRequest,
  UserDeleteRequest,
  UserDetailData,
  UserListQuery,
  UserListData,
} from "@/types/userType";
import { CacheStrategies } from "@/config/cacheStrategies";
import apiClient from "@/api/apiClient";
import type { ApiResponse } from "@/types/api";
import { handleApiError } from "@/utils/errorHandler";

// ユーザー一覧取得用フック（サービス単位でキャッシュ設定をカスタマイズ）
export const useUserList = () => {
  return useFetch<userType[]>(
    "userList",
    API_ENDPOINTS.USER.LIST,
    undefined,
    CacheStrategies.READ_ONLY
  );
};

// ユーザープロフィール取得用フック（デフォルトのキャッシュ設定を利用）
export const useUserProfile = () => {
  return useFetch<userType>("userProfile", API_ENDPOINTS.USER.GET_PROFILE);
};

// ユーザー詳細取得（ID指定で切り替え）
export const useUserDetail = (userId: string | undefined) => {
  return useFetch<userType>(
    "userDetail",
    userId ? `${API_ENDPOINTS.USER.LIST}/${userId}` : "",
    undefined,
    {
      staleTime: 1000 * 60 * 1,
    }
  );
};

export const useUpdateUserProfile = () => {
  return useApiMutation<{ name: string; email: string }, { name: string; email: string }>(
    "put",
    API_ENDPOINTS.USER.UPDATE_PROFILE
  );
};

/**
 * ユーザー作成API
 * POST /api/user/create
 */
export const createUserApi = async (request: UserCreateRequest): Promise<void> => {
  try {
    await apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.USER.CREATE, request);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ユーザー詳細取得API
 * GET /api/user/{id}
 */
export const getUserDetailApi = async (userId: string): Promise<UserDetailData> => {
  try {
    const response = await apiClient.get<ApiResponse<UserDetailData>>(
      `${API_ENDPOINTS.USER.DETAIL}/${userId}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ユーザー更新API
 * PUT /api/user/{id}
 */
export const updateUserApi = async (userId: string, request: UserUpdateRequest): Promise<void> => {
  try {
    await apiClient.put<ApiResponse<unknown>>(
      `${API_ENDPOINTS.USER.DETAIL}/${userId}`,
      request
    );
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ユーザー削除API
 * PUT /api/user/{id}/delete
 */
export const deleteUserApi = async (userId: string, request: UserDeleteRequest): Promise<void> => {
  try {
    await apiClient.put<ApiResponse<unknown>>(
      `${API_ENDPOINTS.USER.DETAIL}/${userId}/delete`,
      request
    );
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ユーザー復元API
 * PUT /api/user/{id}/restore
 */
export const restoreUserApi = async (userId: string): Promise<void> => {
  try {
    await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.USER.DETAIL}/${userId}/restore`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ユーザーロック解除API
 * PUT /api/user/unlock
 */
export const unlockUserApi = async (lockedUserId: string): Promise<void> => {
  try {
    await apiClient.put<ApiResponse<unknown>>(API_ENDPOINTS.USER.UNLOCK, { lockedUserId });
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ユーザー一覧取得API（直接呼び出し）
 * GET /api/user/list?pageNumber=&pagesize=&name=&roleId=&isLocked=&isDeleted=
 */
export const getUserListApi = async (query: UserListQuery): Promise<UserListData> => {
  try {
    const response = await apiClient.get<ApiResponse<UserListData>>(API_ENDPOINTS.USER.LIST, {
      params: query,
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
