import apiClient from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { handleApiError } from "@/utils/errorHandler";
import type { ApiResponse } from "@/types/api";
import { getMessage, MessageCodes } from "@/message";
import type {
  SystemSettingData,
  SystemSettingResponse,
  SystemSettingUpdateRequest,
} from "@/types/systemSetting";

/**
 * システム設定取得
 * GET /api/system
 */
export const getSystemSettingApi = async (): Promise<SystemSettingData> => {
  try {
    const response = await apiClient.get<ApiResponse<SystemSettingResponse<SystemSettingData>>>(
      API_ENDPOINTS.SYSTEM_SETTING.GET
    );
    return response.data.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.FETCH_FAILED, "システム設定"));
    throw error;
  }
};

/**
 * システム設定更新
 * PUT /api/system
 */
export const updateSystemSettingApi = async (
  data: SystemSettingUpdateRequest
): Promise<SystemSettingData> => {
  try {
    const response = await apiClient.put<ApiResponse<SystemSettingResponse<SystemSettingData>>>(
      API_ENDPOINTS.SYSTEM_SETTING.UPDATE,
      data
    );
    return response.data.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "システム設定の更新"));
    throw error;
  }
};

export const reloadSystemSettingCacheApi = async (): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.SETTINGS.REROAD_SETTING, {});
};
