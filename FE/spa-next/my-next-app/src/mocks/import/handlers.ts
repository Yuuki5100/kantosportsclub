import type { ApiResponse } from "@/types/api";
import type { NotificationPayload } from "@/components/providers/WebSocketProvider";
import type { TemplateSchemaFromYAML } from "@/utils/file/types";
import { buildMockUploadPayload, mockImportHistory, mockTemplateSchemas } from "./data";

export const mockGetImportHistory = async () => {
  const list = [...mockImportHistory];
  (list as unknown as { data?: typeof list }).data = list;
  return list;
};

export const mockUploadImportFile = async (
  fileName: string,
  extension: string
): Promise<ApiResponse<NotificationPayload>> => {
  return {
    success: true,
    data: buildMockUploadPayload(fileName, extension),
    error: null,
  };
};

export const mockGetTemplateSchema = async (kind: string): TemplateSchemaFromYAML => {
  return mockTemplateSchemas[kind] ?? mockTemplateSchemas.users;
};

export const mockGetTemplateSchemaResponse = async (kind: string) => {
  return {
    success: true,
    data: {
      [kind]: await mockGetTemplateSchema(kind),
    },
    error: null,
  };
};

export const mockDownloadReady = async (): Promise<ApiResponse<NotificationPayload>> => {
  return {
    success: true,
    data: buildMockUploadPayload("mock-report.pdf", "pdf"),
    error: null,
  };
};

export const mockDownloadImportFile = async (): Promise<Blob> => {
  return new Blob(["mock download"], { type: "application/octet-stream" });
};
