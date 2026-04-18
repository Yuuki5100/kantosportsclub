import apiClient from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { handleApiError } from "@/utils/errorHandler";
import type { ApiResponse } from "@/types/api";
import { getMessage, MessageCodes } from "@/message";
import type {
  ManualUploadResponse,
  ManualCreateRequest,
  ManualCreateResponse,
  ManualListQuery,
  ManualListResponse,
  ManualDetailResponse,
  ManualUpdateRequest,
  ManualUpdateResponse,
} from "@/types/manual";

/**
 * マニュアル一覧取得
 * GET /api/manual/list
 */
export const getManualListApi = async (query?: ManualListQuery): Promise<ManualListResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<ManualListResponse>>(API_ENDPOINTS.MANUAL.LIST, {
      params: query,
    });
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.FETCH_FAILED, "マニュアル一覧"));
    throw error;
  }
};

/**
 * マニュアル詳細取得
 * GET /api/manual/{id}
 */
export const getManualDetailApi = async (manualId: number): Promise<ManualDetailResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<ManualDetailResponse>>(
      `${API_ENDPOINTS.MANUAL.DETAIL}/${manualId}`
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.FETCH_FAILED, "マニュアル詳細"));
    throw error;
  }
};

/**
 * マニュアルファイルアップロード
 * POST /api/manual/upload
 */
export const uploadManualFilesApi = async (files: File[]): Promise<ManualUploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post<ApiResponse<ManualUploadResponse>>(
      API_ENDPOINTS.MANUAL.UPLOAD,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "マニュアルファイルのアップロード"));
    throw error;
  }
};

/**
 * マニュアルファイルダウンロード
 * GET /api/manual/download?id={docId}
 */
export const downloadManualFileApi = async (docId: string): Promise<Blob> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.MANUAL.DOWNLOAD, {
      params: { id: docId },
      responseType: "blob",
    });
    return response.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "マニュアルファイルのダウンロード"));
    throw error;
  }
};

/**
 * マニュアル作成
 * POST /api/manual/create
 */
export const createManualApi = async (data: ManualCreateRequest): Promise<ManualCreateResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<ManualCreateResponse>>(
      API_ENDPOINTS.MANUAL.CREATE,
      data
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "マニュアルの作成"));
    throw error;
  }
};

/**
 * マニュアル更新
 * PUT /api/manual/{id}
 */
export const updateManualApi = async (
  manualId: number,
  data: ManualUpdateRequest
): Promise<ManualUpdateResponse> => {
  try {
    const response = await apiClient.put<ApiResponse<ManualUpdateResponse>>(
      `${API_ENDPOINTS.MANUAL.UPDATE}/${manualId}`,
      data
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "マニュアルの更新"));
    throw error;
  }
};

/**
 * マニュアル削除（論理削除）
 * PUT /api/manual/delete/{id}
 */
export const deleteManualApi = async (manualId: number): Promise<void> => {
  try {
    await apiClient.put(`${API_ENDPOINTS.MANUAL.DELETE}/${manualId}`);
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "マニュアルの削除"));
    throw error;
  }
};
