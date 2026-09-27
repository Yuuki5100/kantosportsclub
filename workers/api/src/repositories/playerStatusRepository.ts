import type { PlayerStatusCreateInput, PlayerStatusItem, PlayerStatusUpdateInput } from "../types/playerStatus";

type PlayerStatusRow = {
  id: number;
  user_id: number;
  review_user_id: number;
  shooting: number | null;
  dribbling: number | null;
  passing: number | null;
  defense: number | null;
  stamina: number | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerStatusExportRow = {
  player_name: string | null;
  position: string | null;
  shooting: number | null;
  dribbling: number | null;
  passing: number | null;
  defense: number | null;
  stamina: number | null;
};

const toPlayerStatusItem = (row: PlayerStatusRow): PlayerStatusItem => ({
  id: row.id,
  userId: row.user_id,
  reviewUserId: row.review_user_id,
  shooting: row.shooting,
  dribbling: row.dribbling,
  passing: row.passing,
  defense: row.defense,
  stamina: row.stamina,
  remarks: row.remarks,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const normalizeNullableNumber = (value: unknown): number | null | undefined => {
  if (value === null) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const normalizeNullableString = (value: unknown): string | null | undefined => {
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return undefined;
};

export const findAllPlayerStatuses = async (db: D1Database): Promise<PlayerStatusItem[]> => {
  const result = await db
    .prepare(
      `SELECT
         id,
         user_id,
         review_user_id,
         shooting,
         dribbling,
         passing,
         defense,
         stamina,
         remarks,
         created_at,
         updated_at
       FROM playerStatus
       WHERE NOT EXISTS (
         SELECT 1 FROM playerStatus newer
         WHERE newer.user_id = playerStatus.user_id
           AND (newer.updated_at > playerStatus.updated_at
             OR (newer.updated_at = playerStatus.updated_at AND newer.id > playerStatus.id))
       )
       ORDER BY updated_at DESC, user_id DESC`
    )
    .all<PlayerStatusRow>();

  return result.results.map(toPlayerStatusItem);
};

export const findPlayerStatusExportRows = async (db: D1Database): Promise<PlayerStatusExportRow[]> => {
  const result = await db.prepare(
    `SELECT
       m.user_name AS player_name,
       m.hope_style AS position,
       latest.shooting,
       latest.dribbling,
       latest.passing,
       latest.defense,
       latest.stamina
     FROM mypage m
     LEFT JOIN playerStatus latest
       ON latest.user_id = m.user_id
      AND NOT EXISTS (
        SELECT 1 FROM playerStatus newer
        WHERE newer.user_id = latest.user_id
          AND (newer.updated_at > latest.updated_at
            OR (newer.updated_at = latest.updated_at AND newer.id > latest.id))
      )
     WHERE m.user_id NOT IN (1, 2, 3)
     ORDER BY m.user_id ASC`
  ).all<PlayerStatusExportRow>();

  return result.results;
};

export const findPlayerStatusById = async (db: D1Database, id: number): Promise<PlayerStatusItem | null> => {
  const row = await db
    .prepare(
      `SELECT
         id,
         user_id,
         review_user_id,
         shooting,
         dribbling,
         passing,
         defense,
         stamina,
         remarks,
         created_at,
         updated_at
       FROM playerStatus
       WHERE id = ?1
       LIMIT 1`
    )
    .bind(id)
    .first<PlayerStatusRow>();

  return row ? toPlayerStatusItem(row) : null;
};

export const findPlayerStatusByUserId = async (
  db: D1Database,
  userId: number
): Promise<PlayerStatusItem | null> => {
  const row = await db
    .prepare(
      `SELECT
         id,
         user_id,
         review_user_id,
         shooting,
         dribbling,
         passing,
         defense,
         stamina,
         remarks,
         created_at,
         updated_at
       FROM playerStatus
       WHERE user_id = ?1
       ORDER BY updated_at DESC, id DESC
       LIMIT 1`
    )
    .bind(userId)
    .first<PlayerStatusRow>();

  return row ? toPlayerStatusItem(row) : null;
};

export const findPlayerStatusesByUserId = async (
  db: D1Database,
  userId: number
): Promise<PlayerStatusItem[]> => {
  const result = await db
    .prepare(
      `SELECT
         id,
         user_id,
         review_user_id,
         shooting,
         dribbling,
         passing,
         defense,
         stamina,
         remarks,
         created_at,
         updated_at
       FROM playerStatus
       WHERE user_id = ?1
       ORDER BY updated_at DESC, id DESC`
    )
    .bind(userId)
    .all<PlayerStatusRow>();

  return result.results.map(toPlayerStatusItem);
};

export const findPlayerStatusByUserIdAndReviewUserId = async (
  db: D1Database,
  userId: number,
  reviewUserId: number
): Promise<PlayerStatusItem | null> => {
  const row = await db
    .prepare(
      `SELECT
         id,
         user_id,
         review_user_id,
         shooting,
         dribbling,
         passing,
         defense,
         stamina,
         remarks,
         created_at,
         updated_at
       FROM playerStatus
       WHERE user_id = ?1
         AND review_user_id = ?2
       ORDER BY updated_at DESC, id DESC
       LIMIT 1`
    )
    .bind(userId, reviewUserId)
    .first<PlayerStatusRow>();

  return row ? toPlayerStatusItem(row) : null;
};

export const createPlayerStatus = async (
  db: D1Database,
  input: PlayerStatusCreateInput
): Promise<PlayerStatusItem | null> => {
  const result = await db
    .prepare(
      `INSERT INTO playerStatus (
         user_id,
         review_user_id,
         shooting,
         dribbling,
         passing,
         defense,
         stamina,
         remarks,
         created_at,
         updated_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`
    )
    .bind(
      input.userId,
      input.reviewUserId,
      input.shooting,
      input.dribbling,
      input.passing,
      input.defense,
      input.stamina,
      normalizeNullableString(input.remarks)
    )
    .first<{ id: number }>();

  if (!result) {
    return null;
  }

  return findPlayerStatusById(db, result.id);
};

export const updatePlayerStatus = async (
  db: D1Database,
  id: number,
  input: PlayerStatusUpdateInput
): Promise<PlayerStatusItem | null> => {
  const exists = await findPlayerStatusById(db, id);
  if (!exists) {
    return null;
  }

  const userId = normalizeNullableNumber(input.userId);
  const reviewUserId = normalizeNullableNumber(input.reviewUserId);
  const shooting = normalizeNullableNumber(input.shooting);
  const dribbling = normalizeNullableNumber(input.dribbling);
  const passing = normalizeNullableNumber(input.passing);
  const defense = normalizeNullableNumber(input.defense);
  const stamina = normalizeNullableNumber(input.stamina);
  const remarks = normalizeNullableString(input.remarks);

  if (
    userId === undefined ||
    reviewUserId === undefined ||
    shooting === undefined ||
    dribbling === undefined ||
    passing === undefined ||
    defense === undefined ||
    stamina === undefined ||
    remarks === undefined
  ) {
    return null;
  }

  await db
    .prepare(
      `UPDATE playerStatus
       SET user_id = ?1,
           review_user_id = ?2,
           shooting = ?3,
           dribbling = ?4,
           passing = ?5,
           defense = ?6,
           stamina = ?7,
           remarks = ?8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?9`
    )
    .bind(
      userId,
      reviewUserId,
      shooting,
      dribbling,
      passing,
      defense,
      stamina,
      remarks,
      id
    )
    .run();

  return findPlayerStatusById(db, id);
};

export const updatePlayerStatusByUserIdAndReviewUserId = async (
  db: D1Database,
  userId: number,
  reviewUserId: number,
  input: PlayerStatusUpdateInput
): Promise<PlayerStatusItem | null> => {
  const existing = await findPlayerStatusByUserIdAndReviewUserId(db, userId, reviewUserId);
  if (!existing) {
    return null;
  }

  const normalizedUserId = normalizeNullableNumber(input.userId);
  const normalizedReviewUserId = normalizeNullableNumber(input.reviewUserId);
  const shooting = normalizeNullableNumber(input.shooting);
  const dribbling = normalizeNullableNumber(input.dribbling);
  const passing = normalizeNullableNumber(input.passing);
  const defense = normalizeNullableNumber(input.defense);
  const stamina = normalizeNullableNumber(input.stamina);
  const remarks = normalizeNullableString(input.remarks);

  if (
    normalizedUserId === undefined ||
    normalizedReviewUserId === undefined ||
    shooting === undefined ||
    dribbling === undefined ||
    passing === undefined ||
    defense === undefined ||
    stamina === undefined ||
    remarks === undefined
  ) {
    return null;
  }

  await db
    .prepare(
      `UPDATE playerStatus
       SET user_id = ?1,
           review_user_id = ?2,
           shooting = ?3,
           dribbling = ?4,
           passing = ?5,
           defense = ?6,
           stamina = ?7,
           remarks = ?8,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?9
         AND review_user_id = ?10`
    )
    .bind(
      normalizedUserId,
      normalizedReviewUserId,
      shooting,
      dribbling,
      passing,
      defense,
      stamina,
      remarks,
      userId,
      reviewUserId
    )
    .run();

  if (normalizedUserId === null || normalizedReviewUserId === null) {
    return null;
  }

  return findPlayerStatusByUserIdAndReviewUserId(db, normalizedUserId, normalizedReviewUserId);
};

export { normalizeNullableNumber, normalizeNullableString };
