import type { ApiResponse } from "@/types/api";
import type { NotificationPayload } from "@/components/providers/WebSocketProvider";
import type { TemplateSchemaFromYAML } from "@/utils/file/types";
import type { JobStatus } from "@/types/job";
import { useQuery } from "@tanstack/react-query";
import {
  mockDownloadImportFile,
  mockDownloadReady,
  mockGetImportHistory,
  mockGetTemplateSchemaResponse,
  mockUploadImportFile,
} from "@/mocks/import/handlers";

export const uploadImportFileWithEndpoint = async (
  _endpoint: string,
  file: File,
  _templateId?: string
): Promise<ApiResponse<NotificationPayload>> => {
  const extension = file.name.split(".").pop() || "csv";
  return mockUploadImportFile(file.name, extension);
};

export const uploadImportFile = async (
  file: File,
  templateId?: string
): Promise<ApiResponse<NotificationPayload>> => {
  return uploadImportFileWithEndpoint("/import/upload", file, templateId);
};

export const getImportHistory = async (): Promise<{ data: JobStatus[] }> => {
  return mockGetImportHistory();
};

export const useImportHistory = () => {
  return useQuery<{ data?: JobStatus[] }, Error>({
    queryKey: ["importHistory", Date.now()],
    queryFn: () => mockGetImportHistory(),
  });
};

export const getTemplateSchemaByEndpoint = async (
  _endpoint: string,
  templateId: string
): Promise<{ success: boolean; data: Record<string, TemplateSchemaFromYAML> }> => {
  return mockGetTemplateSchemaResponse(templateId);
};

export const getTemplateSchema = async (
  templateId: string
): Promise<{ success: boolean; data: Record<string, TemplateSchemaFromYAML> }> => {
  return getTemplateSchemaByEndpoint("/import/templateGet", templateId);
};

export const requestDownloadReady = async (
  _reportId: string,
  _fileName: string,
  _extension: string
): Promise<ApiResponse<NotificationPayload>> => {
  return mockDownloadReady();
};

export const downloadImportFile = async (_jobName: string): Promise<Blob> => {
  return mockDownloadImportFile();
};

export const uploadFileToServer = uploadImportFile;
