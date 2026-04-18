// src/types/UserType.ts

// ユーザーの権限を定義
export type UserRole = 'admin' | 'user' | 'viewer' | 'custom';

// ユーザーの型定義
export interface userType {
  id: string;       // ユーザーID（必要に応じて number に変更可）
  name: string;     // ユーザー名
  email: string;    // メールアドレス
  role: UserRole;   // ユーザー権限
  // その他必要なフィールドを追加可能
}

/** POST /api/user/create のリクエストボディ */
export interface UserCreateRequest {
  userId: string;
  email: string;
  surname: string;
  givenName: string;
  roleId: number;
  phoneNo: string;
}

/** PUT /api/user/{id} のリクエストボディ */
export interface UserUpdateRequest {
  email: string;
  surname: string;
  givenName: string;
  roleId: number;
  phoneNo: string;
}

/** PUT /api/user/{id}/delete のリクエストボディ */
export interface UserDeleteRequest {
  deletionReason: string;
}

/** GET /api/user/{id} レスポンスの data 部分 */
export interface UserDetailData {
  userId: string;
  email: string;
  surname: string;
  givenName: string;
  roleName: string;
  roleId: number;
  isLocked: boolean;
  isDeleted: boolean;
  mobileNo: string;
  passwordSetTime: string | null;
  failedLoginAttempts: number;
  lockOutTime: string | null;
  deletionReason: string;
  creatorUserId: string;
  createdAt: string | null;
  creatorUserName: string;
  editorUserId: string;
  editorUserName: string;
  updatedAt: string | null;
}

/** /api/user/list のクエリパラメータ */
export interface UserListQuery {
  pageNumber: number;
  pagesize: number;
  name?: string;
  roleId?: number;
  isLocked?: boolean;
  isDeleted?: boolean;
}

/** /api/user/list レスポンスのユーザー1件 */
export interface UserListItem {
  userId: string;
  email: string;
  surname: string;
  givenName: string;
  roleId: number;
  roleName: string;
  isLocked: boolean;
  failedLoginAttempts: number;
  lockedAt: string | null;
  updatedAt: string;
}

/** /api/user/list レスポンスの data 部分 */
export interface UserListData {
  users: UserListItem[];
  total: number;
}
