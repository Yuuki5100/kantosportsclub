import type { ApiResponse } from "@/types/api";
import type { UploadedFileResponse } from "../real/fileService";
import { mockDeleteFile, mockDownloadFile, mockUploadFile } from "@/mocks/files/handlers";

export const uploadFileApi = async (
  file: File,
  _resourceType: string = "USER"
): Promise<ApiResponse<UploadedFileResponse>> => {
  const res = await mockUploadFile(file);
  return { success: true, data: res, error: null };
};

export const downloadFileApi = async (_fileId: string): Promise<Blob> => {
  return mockDownloadFile();
};

export const deleteFileApi = async (fileId: string): Promise<void> => {
  await mockDeleteFile(fileId);
};
