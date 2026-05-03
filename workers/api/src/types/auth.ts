export type AuthMode = "internal" | "gbiz";

export type AuthUser = {
  userId: string;
  roleId: number | null;
  displayName: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type AuthStatusResponse = {
  authenticated: boolean;
  user?: AuthUser | null;
  rolePermissions?: Record<string, number> | null;
  userPermissions?: Array<{
    permissionName: string;
    statusLevelId: number;
  }>;
};

export type LoginInput = {
  userId: string;
  password: string;
};

export type ExternalLoginInput = {
  clientId: string;
  clientSecret: string;
};

export type EndpointPermission = {
  method: string;
  path: string;
  requiredLevel: number;
};

export type AuthGlobal = typeof globalThis & {
  AUTH_SECRET?: string;
  JWT_SECRET?: string;
};

export type UserPermission = {
  permissionId: string;
  statusLevelId: number;
  menuFunctionId?: string | null;
};

