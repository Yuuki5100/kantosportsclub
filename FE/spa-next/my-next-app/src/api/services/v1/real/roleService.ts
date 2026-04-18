import apiClient from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import type { ApiResponse } from "@/types/api";
import { handleApiError } from "@/utils/errorHandler";
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

/**
 * ロール一覧取得API
 * GET /api/roles/list?pageNumber=&pagesize=&isDeleted=&name=
 */
export const getRoleListApi = async (query: RoleListQuery): Promise<RoleListData> => {
  try {
    const response = await apiClient.get<ApiResponse<RoleListData>>(API_ENDPOINTS.ROLE.LIST, {
      params: query,
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ロールドロップダウン取得API
 * GET /api/roles/dropdown
 */
export const getRoleDropdownApi = async (): Promise<RoleDropdownData> => {
  try {
    const response = await apiClient.get<ApiResponse<RoleDropdownData>>(API_ENDPOINTS.ROLE.DROPDOWN);
    return response.data.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ロール詳細取得API
 * GET /api/roles/{id}
 */
export const getRoleDetailApi = async (roleId: number): Promise<RoleDetailData> => {
  try {
    const response = await apiClient.get<ApiResponse<RoleDetailData>>(
      `${API_ENDPOINTS.ROLE.DETAIL}/${roleId}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ロール作成API
 * POST /api/roles/create
 */
export const createRoleApi = async (request: RoleCreateRequest): Promise<RoleCreateResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<RoleCreateResponse>>(
      `${API_ENDPOINTS.ROLE.DETAIL}/create`,
      request
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ロール更新API
 * PUT /api/roles/{id}
 */
export const updateRoleApi = async (roleId: number, request: RoleUpdateRequest): Promise<void> => {
  try {
    await apiClient.put<ApiResponse<unknown>>(
      `${API_ENDPOINTS.ROLE.DETAIL}/${roleId}`,
      request
    );
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * ロール削除API
 * PUT /api/roles/{id}/delete
 */
export const deleteRoleApi = async (roleId: number, request: RoleDeleteRequest): Promise<void> => {
  await apiClient.put<ApiResponse<unknown>>(
    `${API_ENDPOINTS.ROLE.DETAIL}/${roleId}/delete`,
    request
  );
};
