import * as real from "./real/fileService";
import * as mock from "./mock/fileService";
import { callWithMockFallback } from "./serviceSelector";

export type { UploadedFileResponse } from "./real/fileService";

export const uploadFileApi = (
  file: Parameters<typeof real.uploadFileApi>[0],
  resourceType?: Parameters<typeof real.uploadFileApi>[1]
) =>
  callWithMockFallback(
    () => mock.uploadFileApi(file, resourceType),
    () => real.uploadFileApi(file, resourceType)
  );

export const downloadFileApi = (fileId: Parameters<typeof real.downloadFileApi>[0]) =>
  callWithMockFallback(() => mock.downloadFileApi(fileId), () => real.downloadFileApi(fileId));

export const deleteFileApi = (fileId: Parameters<typeof real.deleteFileApi>[0]) =>
  callWithMockFallback(() => mock.deleteFileApi(fileId), () => real.deleteFileApi(fileId));
