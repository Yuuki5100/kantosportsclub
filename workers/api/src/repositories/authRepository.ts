import bcrypt from 'bcryptjs';
import type { UserPermission } from '../types/auth';

/**
 * D1Database を repository に渡すための簡易 holder。
 *
 * 現在の authService.ts が関数 export 形式のため、route 側で request ごとに
 * setAuthRepositoryDb(c.env.DB) を呼んでから service を呼ぶ想定。
 */
let db: D1Database | null = null;

export const setAuthRepositoryDb = (database: D1Database): void => {
  db = database;
};

const getDb = (): D1Database => {
  if (!db) {
    throw new Error('D1 database is not initialized. Call setAuthRepositoryDb(c.env.DB) before auth repository access.');
  }

  return db;
};

export type AuthUserRow = {
  userId: string;
  username: string;
  passwordHash: string | null;
  displayName: string | null;
  email: string | null;
  roleId: number | null;
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
  roleId: string | number | null;
  status?: string | null;
  lockedUntil?: string | null;
};

type DbRolePermissionRow = {
  permissionId?: string | null;
  permissionName?: string | null;
  statusLevelId: number;
  menuFunctionId?: string | null;
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
    roleId: toNullableNumber(row.roleId),
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
  username: string,
): Promise<AuthUserRow | null> => {
  const row = await getDb()
    .prepare(
      `
      SELECT
        CAST(id AS TEXT) AS userId,
        username,
        password AS passwordHash,
        username AS displayName,
        email,
        id AS roleId,
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
  loginId: string,
): Promise<AuthUserRow | null> => {
  return findUserByUsername(loginId);
};

/**
 * access token claims.sub / refresh token の userId からユーザーを取得する。
 */
export const findUserById = async (
  userId: string,
): Promise<AuthUserRow | null> => {
  console.log("[authRepository] findUserById start", { userId });
  const row = await getDb()
    .prepare(
      `
      SELECT
        CAST(id AS TEXT) AS userId,
        username,
        password AS passwordHash,
        username AS displayName,
        email,
        id AS roleId,
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
    roleId: row?.roleId ?? null,
  });

  return normalizeUserRow(row ?? null);
};

/**
 * 現在の簡易DDLでは role_permission ではなく user_role_permissions なので、
 * roleId を users.id 相当として扱い、user_role_permissions から権限を返す。
 *
 * resource には menu_function_id 相当の値が入っている前提。
 */
export const findRolePermissions = async (
  roleId: number,
): Promise<UserPermission[]> => {
  const result = await getDb()
    .prepare(
      `
      SELECT
        resource AS permissionId,
        resource AS permissionName,
        permission_level AS statusLevelId,
        resource AS menuFunctionId
      FROM user_role_permissions
      WHERE user_id = ?
      ORDER BY resource
      `,
    )
    .bind(roleId)
    .all<DbRolePermissionRow>();

  return (result.results ?? []).map((row) => ({
    permissionId: row.permissionId ?? undefined,
    permissionName: row.permissionName ?? undefined,
    statusLevelId: row.statusLevelId,
    menuFunctionId: row.menuFunctionId ?? null,
  }));
};

/**
 * refresh token 保存。
 *
 * 先に作成した簡易DDLに auth_refresh_token が無い場合は、
 * READMEの追加DDLを実行してください。
 */
export const insertRefreshToken = async (input: {
  userId: string;
  tokenHash: string;
  expiresAt: string;
  userAgent: string | null;
  ipAddress: string | null;
}): Promise<void> => {
  await getDb()
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
  tokenHash: string,
): Promise<AuthRefreshTokenRow | null> => {
  const row = await getDb()
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
  tokenHash: string,
): Promise<void> => {
  await getDb()
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

export const verifyPassword = async (
  plainPassword: string,
  passwordHash: string | null,
): Promise<boolean> => {
  if (!passwordHash) {
    return false;
  }

  try {
    return await bcrypt.compare(plainPassword, passwordHash);
  } catch {
    return false;
  }
};
