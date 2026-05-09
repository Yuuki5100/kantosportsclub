import { verifyPasswordHash } from '../auth/passwordHash';

export type AuthUserRow = {
  userId: string;
  username: string;
  passwordHash: string | null;
  displayName: string | null;
  email: string | null;
  roleLevel: number | null;
  status?: string | null;
  lockedUntil?: string | null;
};

export type AuthRefreshTokenRow = {
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
};

type DbUserRow = {
  userId: string | number;
  username: string;
  passwordHash: string | null;
  displayName: string | null;
  email: string | null;
  role: string | null;
  status?: string | null;
  lockedUntil?: string | null;
};

type DbRefreshTokenRow = {
  userId: string | number;
  tokenHash: string;
  expiresAt: string;
  revokedAt?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
};

const toNullableNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const roleToLevel = (role: string | null | undefined): number | null => {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toUpperCase();
  if (normalized === "ADMIN" || normalized === "LEVEL_3") {
    return 3;
  }
  if (normalized === "USER" || normalized === "LEVEL_2") {
    return 2;
  }
  if (normalized === "VIEWER" || normalized === "LEVEL_1") {
    return 1;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeUserRow = (row: DbUserRow | null): AuthUserRow | null => {
  if (!row) {
    return null;
  }

  return {
    userId: String(row.userId),
    username: row.username,
    passwordHash: row.passwordHash,
    displayName: row.displayName,
    email: row.email,
    roleLevel: roleToLevel(row.role),
    status: row.status ?? 'ACTIVE',
    lockedUntil: row.lockedUntil ?? null,
  };
};

const normalizeRefreshTokenRow = (
  row: DbRefreshTokenRow | null,
): AuthRefreshTokenRow | null => {
  if (!row) {
    return null;
  }

  return {
    userId: String(row.userId),
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt ?? null,
    userAgent: row.userAgent ?? null,
    ipAddress: row.ipAddress ?? null,
  };
};

/**
 * username でユーザーを取得する。
 *
 * DB列は users.password だが、service層は passwordHash として扱うため、
 * SQLで password AS passwordHash にマッピングする。
 *
 * 現在の簡易DDLでは users に display_name / role_id / status / locked_until が
 * 無い可能性があるため、存在しない列は固定値/代替値で返す。
 */
export const findUserByUsername = async (
  db: D1Database,
  username: string,
): Promise<AuthUserRow | null> => {
  const row = await db
    .prepare(
      `
      SELECT
        CAST(id AS TEXT) AS userId,
        username,
        password AS passwordHash,
        username AS displayName,
        email,
        role,
        'ACTIVE' AS status,
        NULL AS lockedUntil
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
    )
    .bind(username)
    .first<DbUserRow>();

  return normalizeUserRow(row ?? null);
};

/**
 * username/userId どちらのログインIDでも拾える互換関数。
 * authService.ts 側が findUserByLoginId を参照している場合はこちらを使う。
 */
export const findUserByLoginId = async (
  db: D1Database,
  loginId: string,
): Promise<AuthUserRow | null> => {
  return findUserByUsername(db, loginId);
};

/**
 * access token claims.sub / refresh token の userId からユーザーを取得する。
 */
export const findUserById = async (
  db: D1Database,
  userId: string,
): Promise<AuthUserRow | null> => {
  console.log("[authRepository] findUserById start", { userId });
  const row = await db
    .prepare(
      `
      SELECT
        CAST(id AS TEXT) AS userId,
        username,
        password AS passwordHash,
        username AS displayName,
        email,
        role,
        'ACTIVE' AS status,
        NULL AS lockedUntil
      FROM users
      WHERE CAST(id AS TEXT) = ?
      LIMIT 1
      `,
    )
    .bind(userId)
    .first<DbUserRow>();

  console.log("[authRepository] findUserById result", {
    userId,
    found: Boolean(row),
    rowUserId: row?.userId ?? null,
    username: row?.username ?? null,
    role: row?.role ?? null,
  });

  return normalizeUserRow(row ?? null);
};

/**
 * refresh token 保存。
 *
 * 先に作成した簡易DDLに auth_refresh_token が無い場合は、
 * READMEの追加DDLを実行してください。
 */
export const insertRefreshToken = async (input: {
  db: D1Database;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  userAgent: string | null;
  ipAddress: string | null;
}): Promise<void> => {
  await input.db
    .prepare(
      `
      INSERT INTO auth_refresh_token (
        user_id,
        token_hash,
        expires_at,
        revoked_at,
        user_agent,
        ip_address,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, NULL, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
    )
    .bind(
      input.userId,
      input.tokenHash,
      input.expiresAt,
      input.userAgent,
      input.ipAddress,
    )
    .run();
};

export const findRefreshTokenByHash = async (
  db: D1Database,
  tokenHash: string,
): Promise<AuthRefreshTokenRow | null> => {
  const row = await db
    .prepare(
      `
      SELECT
        CAST(user_id AS TEXT) AS userId,
        token_hash AS tokenHash,
        expires_at AS expiresAt,
        revoked_at AS revokedAt,
        user_agent AS userAgent,
        ip_address AS ipAddress
      FROM auth_refresh_token
      WHERE token_hash = ?
      LIMIT 1
      `,
    )
    .bind(tokenHash)
    .first<DbRefreshTokenRow>();

  return normalizeRefreshTokenRow(row ?? null);
};

export const revokeRefreshToken = async (
  db: D1Database,
  tokenHash: string,
): Promise<void> => {
  await db
    .prepare(
      `
      UPDATE auth_refresh_token
      SET
        revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
      WHERE token_hash = ?
      `,
    )
    .bind(tokenHash)
    .run();
};

export const updateLastLoginAt = async (
  userId: string,
): Promise<void> => {
  /*
   * 現在の簡易DDLでは users.last_login_at が無い可能性があるため no-op。
   */
  void userId;
};

export const updateUserPasswordHash = async (
  db: D1Database,
  userId: string,
  passwordHash: string,
): Promise<void> => {
  await db
    .prepare(
      `
      UPDATE users
      SET password = ?
      WHERE CAST(id AS TEXT) = ?
      `,
    )
    .bind(passwordHash, userId)
    .run();
};

export const verifyPassword = async (
  plainPassword: string,
  passwordHash: string | null,
): Promise<boolean> => {
  return verifyPasswordHash(plainPassword, passwordHash);
};
