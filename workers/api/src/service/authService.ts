import type {
  AuthMode,
  AuthSession,
  AuthStatusResponse,
  ExternalLoginInput,
  LoginInput,
  AuthUser,
} from "../types/auth";
import {
  createAccessToken,
  createAuthSession,
  createRefreshToken,
  hashToken,
  verifyAccessToken,
} from "../function/authToken";
import {
  findUserByLoginId,
  findUserById,
  insertRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  updateLastLoginAt,
  updateUserPasswordHash,
  verifyPassword,
} from "../repositories/authRepository";
import {
  hashPassword,
  isPasswordHashUpgradeRequired,
} from "../auth/passwordHash";

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 60 * 30;
const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 30;

type AuthUserRow = {
  userId: string;
  username: string;
  passwordHash: string | null;
  displayName: string | null;
  email: string | null;
  roleLevel: number | null;
  status?: string | null;
  lockedUntil?: string | null;
};

type RefreshTokenRow = {
  userId: string;
  expiresAt: string;
  revokedAt?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
};

type BuildSessionInput = {
  db: D1Database;
  user: AuthUserRow;
  userAgent?: string | null;
  ipAddress?: string | null;
};

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

const toAuthUser = (user: AuthUserRow): AuthUser => ({
  userId: user.userId,
  roleLevel: user.roleLevel,
  displayName: user.displayName,
  email: user.email,
});

const buildSession = async ({
  db,
  user,
  userAgent,
  ipAddress,
}: BuildSessionInput): Promise<AuthSession> => {
  const claims = {
    sub: user.userId,
    roleLevel: user.roleLevel,
    name: user.displayName,
  };

  const accessToken = await createAccessToken(claims, {
    expiresInSeconds: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  });

  const refreshToken = createRefreshToken();
  const tokenHash = await hashToken(refreshToken);
  const expiresAt = addSeconds(now(), REFRESH_TOKEN_EXPIRES_IN_SECONDS);

  await insertRefreshToken({
    db,
    userId: user.userId,
    tokenHash,
    expiresAt: toIsoString(expiresAt),
    userAgent: userAgent ?? null,
    ipAddress: ipAddress ?? null,
  });

  return createAuthSession(accessToken, refreshToken, claims);
};

export const login = async (db: D1Database, input: LoginInput): Promise<AuthSession | null> => {
  if (getAuthMode() !== "internal") {
    throw new Error("Unsupported auth mode");
  }

  const username = input.username?.trim() || input.userId?.trim();
  const password = input.password ?? "";

  if (!username || !password) {
    return null;
  }

  const user = await findUserByLoginId(db, username) as AuthUserRow | null;

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

  if (isPasswordHashUpgradeRequired(user.passwordHash)) {
    await updateUserPasswordHash(db, user.userId, await hashPassword(password));
  }

  await updateLastLoginAt(user.userId);

  return buildSession({
    db,
    user,
    userAgent: input.userAgent ?? null,
    ipAddress: input.ipAddress ?? null,
  });
};

export const refresh = async (db: D1Database, refreshToken: string): Promise<AuthSession | null> => {
  if (!refreshToken) {
    return null;
  }

  const tokenHash = await hashToken(refreshToken);
  const tokenRow = await findRefreshTokenByHash(db, tokenHash) as RefreshTokenRow | null;

  if (!tokenRow) {
    return null;
  }

  if (tokenRow.revokedAt) {
    return null;
  }

  if (new Date(tokenRow.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const user = await findUserById(db, tokenRow.userId) as AuthUserRow | null;

  if (!user) {
    return null;
  }

  if (!isActiveUser(user)) {
    return null;
  }

  if (isFuture(user.lockedUntil)) {
    return null;
  }

  // refresh token rotation
  await revokeRefreshToken(db, tokenHash);

  return buildSession({
    db,
    user,
    userAgent: tokenRow.userAgent ?? null,
    ipAddress: tokenRow.ipAddress ?? null,
  });
};

export const logout = async (db: D1Database, refreshToken: string): Promise<void> => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = await hashToken(refreshToken);
  await revokeRefreshToken(db, tokenHash);
};

export const status = async (db: D1Database, accessToken?: string): Promise<AuthStatusResponse> => {
  console.log("[authService] status start", {
    hasAccessToken: Boolean(accessToken),
    accessTokenPrefix: accessToken ? accessToken.slice(0, 24) : null,
  });

  if (!accessToken) {
    console.log("[authService] status no access token");
    return {
      authenticated: false,
      user: null,
      roleLevel: null,
    };
  }

  const claims = await verifyAccessToken(accessToken);

  if (!claims) {
    console.log("[authService] status claims invalid");
    return {
      authenticated: false,
      user: null,
      roleLevel: null,
    };
  }

  const user = await findUserById(db, claims.sub) as AuthUserRow | null;

  if (!user || !isActiveUser(user) || isFuture(user.lockedUntil)) {
    console.log("[authService] status user invalid", {
      found: Boolean(user),
      active: user ? isActiveUser(user) : false,
      lockedUntil: user?.lockedUntil ?? null,
    });
    return {
      authenticated: false,
      user: null,
      roleLevel: null,
    };
  }

  console.log("[authService] status success", {
    userId: user.userId,
    roleLevel: user.roleLevel,
  });

  return {
    authenticated: true,
    user: toAuthUser(user),
    roleLevel: user.roleLevel,
  };
};

export const externalLogin = async (_input?: ExternalLoginInput): Promise<never> => {
  throw new Error("External login is not implemented");
};

export const callback = async (_code: string, _state: string): Promise<AuthSession | null> => {
  throw new Error("External login callback is not implemented");
};
