import * as real from "./real/noticeService";
import * as mock from "./mock/noticeService";
import { callWithMockFallback } from "./serviceSelector";

export const getNoticeListApi = () =>
  callWithMockFallback(() => mock.getNoticeListApi(), () => real.getNoticeListApi());

export const getNoticeDetailApi = (noticeId: Parameters<typeof real.getNoticeDetailApi>[0]) =>
  callWithMockFallback(() => mock.getNoticeDetailApi(noticeId), () => real.getNoticeDetailApi(noticeId));

export const uploadNoticeFilesApi = (files: Parameters<typeof real.uploadNoticeFilesApi>[0]) =>
  callWithMockFallback(() => mock.uploadNoticeFilesApi(files), () => real.uploadNoticeFilesApi(files));

export const downloadNoticeFileApi = (docId: Parameters<typeof real.downloadNoticeFileApi>[0]) =>
  callWithMockFallback(() => mock.downloadNoticeFileApi(docId), () => real.downloadNoticeFileApi(docId));

export const createNoticeApi = (data: Parameters<typeof real.createNoticeApi>[0]) =>
  callWithMockFallback(() => mock.createNoticeApi(data), () => real.createNoticeApi(data));

export const updateNoticeApi = (
  noticeId: Parameters<typeof real.updateNoticeApi>[0],
  data: Parameters<typeof real.updateNoticeApi>[1]
) => callWithMockFallback(() => mock.updateNoticeApi(noticeId, data), () => real.updateNoticeApi(noticeId, data));
