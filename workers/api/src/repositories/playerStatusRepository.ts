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

type PlayerStatusAggregateRow = {
  user_id: number;
  review_user_id: number;
  record_count: number;
  shooting_sum: number;
  dribbling_sum: number;
  passing_sum: number;
  defense_sum: number;
  stamina_sum: number;
  remarks: string | null;
  created_at: string;
  updated_at: string;
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

const floorDivide = (sum: number, count: number): number | null => {
  if (!Number.isFinite(sum) || !Number.isFinite(count) || count <= 0) {
    return null;
  }
  return Math.floor(sum / count);
};

export const findAllPlayerStatuses = async (db: D1Database): Promise<PlayerStatusItem[]> => {
  const result = await db
    .prepare(
      `SELECT
         user_id,
         MAX(review_user_id) AS review_user_id,
         COUNT(*) AS record_count,
         SUM(COALESCE(shooting, 0)) AS shooting_sum,
         SUM(COALESCE(dribbling, 0)) AS dribbling_sum,
         SUM(COALESCE(passing, 0)) AS passing_sum,
         SUM(COALESCE(defense, 0)) AS defense_sum,
         SUM(COALESCE(stamina, 0)) AS stamina_sum,
         MAX(remarks) AS remarks,
         MIN(created_at) AS created_at,
         MAX(updated_at) AS updated_at
       FROM playerStatus
       GROUP BY user_id
       ORDER BY MAX(updated_at) DESC, user_id DESC`
    )
    .all<PlayerStatusAggregateRow>();

  return result.results.map((row, index) => {
    const recordCount = Number(row.record_count);
    const averageRow: PlayerStatusRow = {
      id: index + 1,
      user_id: row.user_id,
      review_user_id: row.review_user_id,
      shooting: floorDivide(Number(row.shooting_sum), recordCount),
      dribbling: floorDivide(Number(row.dribbling_sum), recordCount),
      passing: floorDivide(Number(row.passing_sum), recordCount),
      defense: floorDivide(Number(row.defense_sum), recordCount),
      stamina: floorDivide(Number(row.stamina_sum), recordCount),
      remarks: row.remarks,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    return toPlayerStatusItem(averageRow);
  });
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

export { normalizeNullableNumber, normalizeNullableString };
