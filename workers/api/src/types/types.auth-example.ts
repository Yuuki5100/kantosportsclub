/*
 * 既存の ../types/types.ts に不足している場合だけ追加してください。
 * すでに同名 type がある場合は、既存定義を優先してください。
 */

export type AuthMode = "internal" | "external" | "mock";

export type LoginInput = {
  username: string;
  password: string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export type ExternalLoginInput = {
  redirectUri?: string;
};

export type AuthUser = {
  userId: string;
  roleId: number | null;
  displayName: string | null;
};

export type UserPermission = {
  permissionId: string;
  statusLevelId: number;
  menuFunctionId?: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type AuthStatusResponse = {
  authenticated: boolean;
  user?: AuthUser | null;
  permissions?: UserPermission[];
};
