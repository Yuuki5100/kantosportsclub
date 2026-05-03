import type {
  AuthMode,
  AuthSession,
  AuthStatusResponse,
  ExternalLoginInput,
  LoginInput,
} from "../types/types";
import {
  createAccessToken,
  createAuthSession,
  createRefreshToken,
  hashToken,
  verifyAccessToken,
} from "../function/authToken";
import {
  findUserByUsername,
  findUserById,
  findRolePermissions,
  insertRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  updateLastLoginAt,
  verifyPassword,
} from "../repositories/authRepository";

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 60 * 15;
const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 30;

export const getAuthMode = (): AuthMode => {
  return "internal";
};

const now = (): Date => new Date();

const addSeconds = (date: Date, seconds: number): Date => {
  return new Date(date.getTime() + seconds * 1000);
};

const toIsoString = (date: Date): string => {
  return date.toISOString();
};

const isFuture = (isoDate: string | null | undefined): boolean => {
  if (!isoDate) return false;
  return new Date(isoDate).getTime() > Date.now();
};

const isActiveUser = (user: { status?: string | null }): boolean => {
  return !user.status || user.status === "ACTIVE";
};

const buildSession = async (input: {
  user: {
    userId: string;
    username: string;
    roleId: number | null;
    displayName: string | null;
  };
  userAgent?: string | null;
  ipAddress?: string | null;
}): Promise<AuthSession> => {
  const claims = {
    sub: input.user.userId,
    roleId: input.user.roleId,
    name: input.user.displayName,
  };

  const accessToken = await createAccessToken(claims, {
    expiresInSeconds: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  });

  const refreshToken = createRefreshToken();
  const refreshTokenHash = await hashToken(refreshToken);
  const issuedAt = now();
  const expiresAt = addSeconds(issuedAt, REFRESH_TOKEN_EXPIRES_IN_SECONDS);

  await insertRefreshToken({
    userId: input.user.userId,
    tokenHash: refreshTokenHash,
    expiresAt: toIsoString(expiresAt),
    userAgent: input.userAgent ?? null,
    ipAddress: input.ipAddress ?? null,
  });

  return createAuthSession(accessToken, refreshToken, claims);
};

export const login = async (input: LoginInput): Promise<AuthSession | null> => {
  if (getAuthMode() !== "internal") {
    throw new Error("Unsupported auth mode");
  }

  const username = input.username?.trim();
  const password = input.password ?? "";

  if (!username || !password) {
    return null;
  }

  const user = await findUserByUsername(username);

  if (!user) {
    return null;
  }

  if (!isActiveUser(user)) {
    return null;
  }

  if (isFuture(user.lockedUntil)) {
    throw new Error("Account is locked");
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);

  if (!passwordOk) {
    return null;
  }

  await updateLastLoginAt(user.userId);

  return buildSession({
    user: {
      userId: user.userId,
      username: user.username,
      roleId: user.roleId,
      displayName: user.displayName,
    },
    userAgent: input.userAgent ?? null,
    ipAddress: input.ipAddress ?? null,
  });
};

export const refresh = async (refreshToken: string): Promise<AuthSession | null> => {
  if (!refreshToken) {
    return null;
  }

  const tokenHash = await hashToken(refreshToken);
  const tokenRow = await findRefreshTokenByHash(tokenHash);

  if (!tokenRow) {
    return null;
  }

  if (tokenRow.revokedAt) {
    return null;
  }

  if (new Date(tokenRow.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const user = await findUserById(tokenRow.userId);

  if (!user) {
    return null;
  }

  if (!isActiveUser(user)) {
    return null;
  }

  if (isFuture(user.lockedUntil)) {
    return null;
  }

  /*
   * Refresh token rotation を採用する場合は、古い refresh token を失効させたうえで
   * 新しい refresh token を発行する。
   */
  await revokeRefreshToken(tokenHash);

  return buildSession({
    user: {
      userId: user.userId,
      username: user.username,
      roleId: user.roleId,
      displayName: user.displayName,
    },
    userAgent: tokenRow.userAgent ?? null,
    ipAddress: tokenRow.ipAddress ?? null,
  });
};

export const logout = async (refreshToken: string): Promise<void> => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = await hashToken(refreshToken);
  await revokeRefreshToken(tokenHash);
};

export const status = async (accessToken?: string): Promise<AuthStatusResponse> => {
  if (!accessToken) {
    return {
      authenticated: false,
      user: null,
      permissions: [],
    };
  }

  const claims = await verifyAccessToken(accessToken);

  if (!claims) {
    return {
      authenticated: false,
      user: null,
      permissions: [],
    };
  }

  const user = await findUserById(claims.sub);

  if (!user || !isActiveUser(user) || isFuture(user.lockedUntil)) {
    return {
      authenticated: false,
      user: null,
      permissions: [],
    };
  }

  const permissions = user.roleId == null
    ? []
    : await findRolePermissions(user.roleId);

  return {
    authenticated: true,
    user: {
      userId: user.userId,
      roleId: user.roleId,
      displayName: user.displayName,
    },
    permissions,
  };
};

export const externalLogin = async (_input?: ExternalLoginInput): Promise<never> => {
  throw new Error("External login is not implemented");
};

export const callback = async (_code: string, _state: string): Promise<AuthSession | null> => {
  throw new Error("External login callback is not implemented");
};
