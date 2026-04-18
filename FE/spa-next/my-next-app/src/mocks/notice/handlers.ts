import type {
  NoticeCreateRequest,
  NoticeCreateResponse,
  NoticeDetailResponse,
  NoticeListResponse,
  NoticeUpdateRequest,
  NoticeUploadResponse,
} from "@/types/notice";
import { ensureScenario, mockScenario } from "@/mocks/common/response";
import { mockNoticeDetailMap, mockNoticeList } from "./data";
import { getMessage, MessageCodes } from "@/message";

export const mockGetNoticeList = async (): Promise<NoticeListResponse> => {
  ensureScenario(mockScenario.noticeListError, "お知らせ一覧の取得に失敗しました");
  return { noticeList: mockNoticeList };
};

export const mockGetNoticeDetail = async (noticeId: number): Promise<NoticeDetailResponse> => {
  const detail = mockNoticeDetailMap[noticeId];
  if (!detail) {
    throw new Error(getMessage(MessageCodes.NOT_FOUND));
  }
  return detail;
};

export const mockCreateNotice = async (_data: NoticeCreateRequest): Promise<NoticeCreateResponse> => {
  return { noticeId: 9999 };
};

export const mockUpdateNotice = async (_noticeId: number, _data: NoticeUpdateRequest): Promise<void> => {
  return;
};

export const mockUploadNoticeFiles = async (_files: File[]): Promise<NoticeUploadResponse> => {
  return { docIds: ["mock/notice/uploaded-file.pdf"] };
};

export const mockDownloadNoticeFile = async (_docId: string): Promise<Blob> => {
  return new Blob(["mock notice file"], { type: "application/pdf" });
};
