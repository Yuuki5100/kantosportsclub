import type { UploadedFileResponse } from "@/hooks/useFileUploader";

export const mockUploadFile = async (file: File): Promise<UploadedFileResponse> => {
  return {
    fileId: `mock-file-${Date.now()}`,
    originalName: file.name,
  };
};

export const mockDownloadFile = async (): Promise<Blob> => {
  return new Blob(["mock file"], { type: "application/octet-stream" });
};

export const mockDeleteFile = async (): Promise<void> => {
  return;
};

