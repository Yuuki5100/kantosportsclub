import type { AuthStatusResponse, UserPermission } from "./types/auth";

export type Bindings = {
  DB?: D1Database;
  kantosportsclub_db: D1Database;
  CORS_ORIGIN?: string;
  R2_PUBLIC_BASE_URL?: string;
  COOKIE_SECURE?: string;
  PERMISSION_CONFIG_CACHE_TTL_SECONDS?: string;
};

export type AuthContext = {
  authenticated: boolean;
  user: AuthStatusResponse["user"] | null;
  permissions: UserPermission[];
  rolePermissions: Record<string, number>;
  accessToken: string;
};

export type AppVariables = {
  requestId: string;
  auth?: AuthContext | null;
};

export const getDb = (env: Bindings): D1Database => env.DB ?? env.kantosportsclub_db;
