export type FileType = 'csv' | 'excel';

export interface HeaderValidationOptions {
  expectedHeaders: string[];
  headerRowIndex?: number;
  delimiter?: string;
  maxRows?: number;
  sheetName?: string; // ✅ これを追加！
}

export interface RowValidationResult {
  errors: string[];
  warnings: string[];
}

export type HeaderType = 'string' | 'number' | 'boolean' | 'date';

export interface HeaderDefinition {
  field: string;
  name?: string;
  required: boolean;
  type: HeaderType;
  repository: string;
  pattern?: RegExp | ((value: string) => boolean);
  validationMessage?: string; // ✅ 追加
  enumValues?: string[]; // ← ✅ これを追加
  sheetName?: string; // ← 追加（undefined なら単一シートとして扱う）
  maxLength?: number;//
}

/**
 * ┌────────────────────────────────────────────────────────┐
 * │ TemplateSchemaFromYAML                                │ ← YAML全体を表すルート型
 * ├────────────────────────────────────────────────────────┤
 * ├─ templateId: string                                    │
 * ├─ version: string                                       │
 * ├─ multiSheet: boolean                                   │
 * ├─ sheets?: TemplateSheetSchema[] ← v2で使用             │
 * │   ├─ sheetName: string                                 │
 * │   └─ columns: ColumnSchema[]                           │
 * │       ├─ field: string                                 │
 * │       ├─ name: string                                  │
 * │       ├─ required: boolean                             │
 * │       ├─ type?: string                                 │
 * │       ├─ repository: string                            │
 * │       ├─ entity?: string                               │
 * │       ├─ maxLength?: number                            │
 * │       ├─ pattern?: string                              │
 * │       ├─ validationMessage?: string                    │
 * │       └─ enumValues?: string[]                         │
 * └─ columns?: ColumnSchema[] ← v1構造のレガシー対応       │
 *     （中身は上記 columns と同じ）                        │
 * └────────────────────────────────────────────────────────┘
 */

export interface TemplateSchemaFromYAML {
  templateId: string;
  version: string;
  multiSheet: boolean;
  sheets?: TemplateSheetSchema[]; // ← v2で使うのはこちら
  columns?: ColumnSchema[];       // ← v1（レガシー）構造
}

export interface TemplateSheetSchema {
  sheetName: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  field: string;
  name: string;
  required: boolean;
  type?: HeaderType;
  repository: string;
  entity?: string;
  maxLength?: number;
  pattern?: RegExp | ((value: string) => boolean);
  validationMessage?: string;
  enumValues?: string | string[];
}

export const initialTemplateSchema: TemplateSchemaFromYAML = {
  templateId: '',
  version: '',
  columns: [],
  multiSheet: false,
};

export interface NotifyEvent<T = unknown> {
  eventType: string;
  refId: string;
  createdAt: string;
  metadata?: Record<string, T>;
}

// Note: NotificationPayload type has been moved to WebSocketProvider.tsx
// to consolidate WebSocket-related types
import type { NotificationPayload } from '@/components/providers/WebSocketProvider';

export type UploadFileResult = {
  data: NotificationPayload;
  success: boolean;
};

export type DownloadResult = {
  data: DownloadUrl;
  success: boolean;
};

export type DownloadUrl = {
  status: string;
  url: string;
}

// 型があるとわかりやすい（任意）
export interface UploadCompleted {
  eventType: 'FILE_UPLOAD_COMPLETED';
  refId: string;
  jobName: string;
}

export interface DownloadCompleted {
  eventType: 'FILE_DOWNLOAD_COMPLETED';
  refId: string;
  url: string;
}

/* ---------- 型定義 ---------- */
// 旧 API（単一イベント購読）のハンドラ型
export type SingleHandler = (msg: unknown) => void;
// 新 API（複数イベント購読）のハンドラ型
export type MultiHandler = (msg: unknown, eventType: string) => void;
