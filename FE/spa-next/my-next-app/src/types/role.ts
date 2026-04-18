// ─── List ───────────────────────────────────────────

/** /api/roles/list のクエリパラメータ */
export interface RoleListQuery {
  pageNumber: number;
  pagesize: number;
  isDeleted?: boolean;
  name?: string;
}

/** /api/roles/list レスポンスのロール1件 */
export interface RoleListItem {
  roleId: number;
  roleName: string;
  description: string;
  updatedAt: string;
}

/** /api/roles/list レスポンスの data 部分 */
export interface RoleListData {
  roles: RoleListItem[];
  total: number;
}

// ─── Dropdown ───────────────────────────────────────

/** /api/roles/dropdown レスポンスのロール1件 */
export interface RoleDropdownItem {
  roleId: number;
  roleName: string;
}

/** /api/roles/dropdown レスポンスの data 部分 */
export interface RoleDropdownData {
  roles: RoleDropdownItem[];
}

// ─── Permission 共通 ────────────────────────────────

/** 権限アイテム（リクエスト用） */
export interface RolePermissionItemRequest {
  permissionId: number;
  statusLevelId: number;
}

/** 権限モジュール（リクエスト用） */
export interface RolePermissionModuleRequest {
  module: string;
  permissions: RolePermissionItemRequest[];
}

/** 権限アイテム（レスポンス用） */
export interface RolePermissionItemResponse {
  rolePermissionId: number;
  permissionId: number;
  permissionName: string;
  statusLevelId: number;
  statusLevelName: string;
}

/** 権限モジュール（レスポンス用） */
export interface RolePermissionModuleResponse {
  module: string;
  permissions: RolePermissionItemResponse[];
}

// ─── Create ─────────────────────────────────────────

/** POST /api/roles/create リクエスト */
export interface RoleCreateRequest {
  roleName: string;
  description: string;
  permissionDetails: RolePermissionModuleRequest[];
}

/** POST /api/roles/create レスポンス */
export interface RoleCreateResponse {
  roleId: number;
}

// ─── Detail ─────────────────────────────────────────

/** GET /api/roles/{id} レスポンス */
export interface RoleDetailData {
  roleId: number;
  roleName: string;
  isDeleted: boolean;
  deletionReason: string | null;
  description: string;
  creatorUserName: string;
  creatorUserId: string;
  createdAt: string;
  editorUserName: string;
  editorUserId: string;
  updatedAt: string;
  permissionDetails: RolePermissionModuleResponse[];
}

// ─── Update ─────────────────────────────────────────

/** PUT /api/roles/{id} リクエスト */
export interface RoleUpdateRequest {
  roleName: string;
  description: string;
  permissionDetails: RolePermissionModuleRequest[];
}

// ─── Delete ─────────────────────────────────────────

/** PUT /api/roles/{id}/delete リクエスト */
export interface RoleDeleteRequest {
  deletionReason: string;
}

// ─── Permission Master ──────────────────────────────

/**
 * DBに登録されている全権限のマスタ定義
 * permissionId / permissionName / module はDBの permissions テーブルと一致させること
 */
export interface PermissionMasterItem {
  permissionId: number;
  permissionName: string;
  module: string;
}

/** 権限レベル定数（status_levels テーブル） */
export const STATUS_LEVEL = {
  NONE: 1,   // なし
  VIEW: 2,   // 参照
  EDIT: 3,   // 更新
} as const;

export const STATUS_LEVEL_LABELS: Record<number, string> = {
  [STATUS_LEVEL.NONE]: "なし",
  [STATUS_LEVEL.VIEW]: "参照",
  [STATUS_LEVEL.EDIT]: "更新",
};

/**
 * DB permissions テーブルのマスタデータ
 * 新しい権限を追加した場合はここにも追加すること
 */
export const PERMISSION_MASTER: PermissionMasterItem[] = [
  { permissionId: 1, permissionName: "USER",            module: "SYSTEM" },
  { permissionId: 2, permissionName: "ROLE",            module: "SYSTEM" },
  { permissionId: 3, permissionName: "SYSTEM_SETTINGS", module: "SYSTEM" },
  { permissionId: 4, permissionName: "NOTICE",          module: "SYSTEM" },
  { permissionId: 5, permissionName: "MANUAL",          module: "MANUAL" },
];

/** モジュール表示名 */
export const MODULE_LABELS: Record<string, string> = {
  SYSTEM: "システム管理",
  MANUAL: "マニュアル管理",
};

/** 権限名の表示名 */
export const PERMISSION_NAME_LABELS: Record<string, string> = {
  USER: "ユーザー",
  ROLE: "ロール",
  SYSTEM_SETTINGS: "システム設定",
  NOTICE: "お知らせ",
  MANUAL: "マニュアル",
};
