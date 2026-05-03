export type AuthMode = "internal" | "external" | "mock" | "gbiz";

export type LoginInput = {
  userId?: string;
  username?: string;
  password: string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export type ExternalLoginInput = {
  redirectUri?: string;
  clientId?: string;
  clientSecret?: string;
};

export type AuthUser = {
  userId: string;
  roleId: number | null;
  displayName: string | null;
};

export type UserPermission = {
  permissionId?: string;
  permissionName?: string;
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
  rolePermissions?: Record<string, number> | null;
  userPermissions?: UserPermission[];
};

export type EndpointPermission = {
  method: string;
  path: string;
  requiredLevel: number;
};

export type AuthClaims = {
  sub: string;
  roleId: number | null;
  name: string | null;
  iat?: number;
  exp?: number;
};

export type TokenOptions = {
  expiresInSeconds: number;
};
