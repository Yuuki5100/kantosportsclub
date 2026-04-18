import type { JobStatus } from "@/types/job";
import type { NotificationPayload } from "@/components/providers/WebSocketProvider";
import type { TemplateSchemaFromYAML } from "@/utils/file/types";
import { initialTemplateSchema } from "@/utils/file/types";

export const mockImportHistory: JobStatus[] = [
  {
    id: 1,
    jobName: "IMPORT_USERS",
    status: "COMPLETED",
    startTime: "2024-01-01 10:00:00",
    endTime: "2024-01-01 10:05:00",
    message: "正常終了",
  },
  {
    id: 2,
    jobName: "IMPORT_ORDERS",
    status: "FAILED",
    startTime: "2024-01-02 11:00:00",
    endTime: "2024-01-02 11:01:00",
    message: "フォーマットエラー",
  },
];

export const mockTemplateSchemas: Record<string, TemplateSchemaFromYAML> = {
  users: {
    ...initialTemplateSchema,
    templateId: "users",
    version: "v1",
    columns: [
      { field: "userId", name: "ユーザーID", required: true, type: "string", repository: "user" },
      { field: "email", name: "メールアドレス", required: true, type: "string", repository: "user" },
    ],
  },
};

export const buildMockUploadPayload = (fileName: string, extension: string): NotificationPayload => ({
  eventType: "FILE_UPLOAD_COMPLETED",
  refId: "MOCK-REF-001",
  extension,
  fileName,
  jobName: "IMPORT_USERS",
});

