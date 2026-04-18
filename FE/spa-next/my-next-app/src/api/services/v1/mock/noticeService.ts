import type {
  NoticeCreateRequest,
  NoticeUpdateRequest,
  NoticeUploadResponse,
  NoticeCreateResponse,
  NoticeListResponse,
  NoticeDetailResponse,
} from "@/types/notice";
import {
  mockCreateNotice,
  mockDownloadNoticeFile,
  mockGetNoticeDetail,
  mockGetNoticeList,
  mockUpdateNotice,
  mockUploadNoticeFiles,
} from "@/mocks/notice/handlers";

export const getNoticeListApi = async (): Promise<NoticeListResponse> => {
  return mockGetNoticeList();
};

export const getNoticeDetailApi = async (noticeId: number): Promise<NoticeDetailResponse> => {
  return mockGetNoticeDetail(noticeId);
};

export const uploadNoticeFilesApi = async (files: File[]): Promise<NoticeUploadResponse> => {
  return mockUploadNoticeFiles(files);
};

export const downloadNoticeFileApi = async (docId: string): Promise<Blob> => {
  return mockDownloadNoticeFile(docId);
};

export const createNoticeApi = async (data: NoticeCreateRequest): Promise<NoticeCreateResponse> => {
  return mockCreateNotice(data);
};

export const updateNoticeApi = async (noticeId: number, data: NoticeUpdateRequest): Promise<void> => {
  return mockUpdateNotice(noticeId, data);
};
