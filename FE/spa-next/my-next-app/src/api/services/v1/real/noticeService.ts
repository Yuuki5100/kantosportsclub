import apiClient from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { handleApiError } from "@/utils/errorHandler";
import type { ApiResponse } from "@/types/api";
import { getMessage, MessageCodes } from "@/message";
import type {
  NoticeCreateRequest,
  NoticeUpdateRequest,
  NoticeUploadResponse,
  NoticeCreateResponse,
  NoticeListResponse,
  NoticeDetailResponse,
} from "@/types/notice";

/**
 * お知らせ一覧取得
 * GET /api/notice/list
 */
export const getNoticeListApi = async (): Promise<NoticeListResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<NoticeListResponse>>(API_ENDPOINTS.NOTICE.LIST);
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.FETCH_FAILED, "お知らせ一覧"));
    throw error;
  }
};

/**
 * お知らせ詳細取得
 * GET /api/notice/notice_id?notice_id={noticeId}
 */
export const getNoticeDetailApi = async (noticeId: number): Promise<NoticeDetailResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<NoticeDetailResponse>>(
      API_ENDPOINTS.NOTICE.DETAIL,
      { params: { notice_id: noticeId } }
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.FETCH_FAILED, "お知らせ詳細"));
    throw error;
  }
};

/**
 * お知らせファイルアップロード
 * POST /api/notice/upload
 */
export const uploadNoticeFilesApi = async (files: File[]): Promise<NoticeUploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post<ApiResponse<NoticeUploadResponse>>(
      API_ENDPOINTS.NOTICE.UPLOAD,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "ファイルアップロード"));
    throw error;
  }
};

/**
 * お知らせファイルダウンロード
 * GET /api/notice/download/{id}
 */
export const downloadNoticeFileApi = async (docId: string): Promise<Blob> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.NOTICE.DOWNLOAD, {
      params: { id: docId },
      responseType: "blob",
    });
    return response.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "ファイルのダウンロード"));
    throw error;
  }
};

/**
 * お知らせ作成
 * POST /api/notice/create
 */
export const createNoticeApi = async (data: NoticeCreateRequest): Promise<NoticeCreateResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<NoticeCreateResponse>>(
      API_ENDPOINTS.NOTICE.CREATE,
      data
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "お知らせの作成"));
    throw error;
  }
};

/**
 * お知らせ更新
 * PUT /api/notice/notice_id?notice_id={noticeId}
 */
export const updateNoticeApi = async (noticeId: number, data: NoticeUpdateRequest): Promise<void> => {
  try {
    await apiClient.put<ApiResponse<void>>(API_ENDPOINTS.NOTICE.UPDATE, data, {
      params: { notice_id: noticeId },
    });
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "お知らせの更新"));
    throw error;
  }
};
