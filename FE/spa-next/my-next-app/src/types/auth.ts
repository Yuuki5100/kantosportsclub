export interface LoginRequest {
  user_id: string;
  password: string;
}

export interface LoginData {
  authenticated: boolean;
  authType: string;
  givenName: string;
  surname: string;
  email: string;
}


// src/types/auth.ts

export interface AuthStatusUser {
  givenName: string;
  surname: string;
  email: string;
  userId: string;
}

export interface UserPermission {
  permissionId: number;
  permissionName: string;
  statusLevelId: number;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  userPermissions?: UserPermission[];
  rolePermissions?: Record<string, number>;
  user?: AuthStatusUser;
}
