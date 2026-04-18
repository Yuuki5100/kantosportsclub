import apiClient from "@/api/apiClient";
import type { ApiResponse } from "@/types/api";

export type UploadedFileResponse = {
  fileId: string;
  originalName: string;
};

export const uploadFileApi = async (
  file: File,
  resourceType: string = "USER"
): Promise<ApiResponse<UploadedFileResponse>> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("resourceType", resourceType);

  const response = await apiClient.post<ApiResponse<UploadedFileResponse>>(
    "/api/files/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

export const downloadFileApi = async (fileId: string): Promise<Blob> => {
  const response = await apiClient.get(`/api/files/download`, {
    params: { fileId },
    responseType: "blob",
  });
  return response.data;
};

export const deleteFileApi = async (fileId: string): Promise<void> => {
  await apiClient.delete(`/api/files/${fileId}`);
};
