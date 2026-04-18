import apiClient from "@/api/apiClient";
import { apiService } from "@/api/apiService";
import type { ApiResponse } from "@/types/api";
import type { NotificationPayload } from "@/components/providers/WebSocketProvider";
import type { TemplateSchemaFromYAML } from "@/utils/file/types";
import type { JobStatus } from "@/types/job";
import { useFetch } from "@/hooks/useApi";

export const uploadImportFileWithEndpoint = async (
  endpoint: string,
  file: File,
  templateId?: string
): Promise<ApiResponse<NotificationPayload>> => {
  const formData = new FormData();
  formData.append("file", file);
  if (templateId) {
    formData.append("templateId", templateId);
  }
  const response = await apiClient.post<ApiResponse<NotificationPayload>>(
    endpoint,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const uploadImportFile = async (
  file: File,
  templateId?: string
): Promise<ApiResponse<NotificationPayload>> => {
  return uploadImportFileWithEndpoint("/import/upload", file, templateId);
};

export const getImportHistory = async (): Promise<{ data: JobStatus[] }> => {
  return apiService.get<{ data: JobStatus[] }>("/import/history");
};

export const useImportHistory = () => {
  return useFetch<{ data?: JobStatus[] }>("importHistory", "/import/history", undefined, {
    useCache: true,
  });
};

export const getTemplateSchemaByEndpoint = async (
  endpoint: string,
  templateId: string
): Promise<{ success: boolean; data: Record<string, TemplateSchemaFromYAML> }> => {
  const response = await apiClient.post<{
    success: boolean;
    data: Record<string, TemplateSchemaFromYAML>;
    error?: string | { code: string; message: string } | string[] | null;
  }>(endpoint, null, {
    headers: { "Content-Type": "text/plain" },
    params: { templateId },
  });
  return response.data;
};

export const getTemplateSchema = async (
  templateId: string
): Promise<{ success: boolean; data: Record<string, TemplateSchemaFromYAML> }> => {
  return getTemplateSchemaByEndpoint("/import/templateGet", templateId);
};

export const requestDownloadReady = async (
  reportId: string,
  fileName: string,
  extension: string
): Promise<ApiResponse<NotificationPayload>> => {
  const response = await apiClient.post<ApiResponse<NotificationPayload>>(
    `/import/downloadReady?reportId=${reportId}&fileName=${fileName}&extention=${extension}`,
    {}
  );
  return response.data;
};

export const downloadImportFile = async (jobName: string): Promise<Blob> => {
  const response = await apiClient.post<Blob>(
    `/import/download?jobName=${jobName}`,
    {},
    { responseType: "blob" }
  );
  return response.data;
};

export const uploadFileToServer = uploadImportFile;
