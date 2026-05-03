export type AuthUserRow = {
  userId: string;
  username: string;
  passwordHash: string | null;
  displayName: string | null;
  roleId: number | null;
  status: string | null;
  lockedUntil: string | null;
};

export type AuthRefreshTokenRow = {
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
  userAgent: string | null;
  ipAddress: string | null;
};

export type RolePermissionRow = {
  permissionId: string;
  statusLevelId: number;
  menuFunctionId?: string | null;
};

export const findUserByUsername = async (_username: string): Promise<AuthUserRow | null> => {
  throw new Error("findUserByUsername is not implemented");
};

export const findUserById = async (_userId: string): Promise<AuthUserRow | null> => {
  throw new Error("findUserById is not implemented");
};

export const findRolePermissions = async (_roleId: number): Promise<RolePermissionRow[]> => {
  throw new Error("findRolePermissions is not implemented");
};

export const insertRefreshToken = async (_input: {
  userId: string;
  tokenHash: string;
  expiresAt: string;
  userAgent: string | null;
  ipAddress: string | null;
}): Promise<void> => {
  throw new Error("insertRefreshToken is not implemented");
};

export const findRefreshTokenByHash = async (
  _tokenHash: string,
): Promise<AuthRefreshTokenRow | null> => {
  throw new Error("findRefreshTokenByHash is not implemented");
};

export const revokeRefreshToken = async (_tokenHash: string): Promise<void> => {
  throw new Error("revokeRefreshToken is not implemented");
};

export const updateLastLoginAt = async (_userId: string): Promise<void> => {
  throw new Error("updateLastLoginAt is not implemented");
};

export const verifyPassword = async (
  _plainPassword: string,
  _passwordHash: string | null,
): Promise<boolean> => {
  throw new Error("verifyPassword is not implemented");
};
