import type {
  PracticeMenuDetailItem,
  PracticeMenuDetailCreateInput,
  PracticeMenuHeaderCreateInput,
  PracticeMenuHeaderItem,
  PracticeMenuHeaderWithDetailsItem,
  PracticeMenuHeaderUpdateInput,
} from "../types/practiceMenu";

type PracticeMenuHeaderRow = {
  id: number;
  title: string | null;
  remarks: string | null;
  updater: string | null;
  created_at: string;
  updated_at: string;
};

type PracticeMenuDetailRow = {
  id: number;
  header_id: number;
  category: string | null;
  menu_name: string;
  menu_time: number | null;
  time_white: string | null;
  start_time: string | null;
  end_time: string | null;
  sort_no: number;
  updater: string | null;
  created_at: string;
  updated_at: string;
};

const toPracticeMenuHeaderItem = (row: PracticeMenuHeaderRow): PracticeMenuHeaderItem => ({
  id: row.id,
  title: row.title,
  remarks: row.remarks,
  updater: row.updater,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const toPracticeMenuDetailItem = (row: PracticeMenuDetailRow): PracticeMenuDetailItem => ({
  id: row.id,
  headerId: row.header_id,
  category: row.category,
  menuName: row.menu_name,
  menuTime: row.menu_time,
  timeWhite: row.time_white,
  startTime: row.start_time,
  endTime: row.end_time,
  sortNo: row.sort_no,
  updater: row.updater,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const normalizeNullableString = (value: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const findAllPracticeMenuHeaders = async (db: D1Database): Promise<PracticeMenuHeaderItem[]> => {
  const result = await db
    .prepare(
      `SELECT
         id,
         title,
         remarks,
         updater,
         created_at,
         updated_at
       FROM practiceMenuHeader
       ORDER BY updated_at DESC, id DESC`
    )
    .all<PracticeMenuHeaderRow>();

  return result.results.map(toPracticeMenuHeaderItem);
};

export const createPracticeMenuHeader = async (
  db: D1Database,
  input: PracticeMenuHeaderCreateInput
): Promise<PracticeMenuHeaderItem | null> => {
  const title = normalizeNullableString(input.title);
  const remarks = normalizeNullableString(input.remarks);
  const updater = normalizeNullableString(input.updater);

  const created = await db
    .prepare(
      `INSERT INTO practiceMenuHeader (
         title,
         remarks,
         updater,
         created_at,
         updated_at
       )
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`
    )
    .bind(title, remarks, updater)
    .first<{ id: number }>();

  if (!created) {
    return null;
  }

  const detailInputs = input.details ?? [];
  for (const detail of detailInputs) {
    await db
      .prepare(
        `INSERT INTO practiceMenuDetail (
           headerId,
           category,
           menuName,
           menuTime,
           timeWhite,
           startTime,
           endTime,
           sortNo,
           updater,
           created_at,
           updated_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .bind(
        created.id,
        normalizeNullableString(detail.category),
        detail.menuName.trim(),
        detail.menuTime,
        normalizeNullableString(detail.timeWhite),
        normalizeNullableString(detail.startTime),
        normalizeNullableString(detail.endTime),
        detail.sortNo,
        normalizeNullableString(detail.updater)
      )
      .run();
  }

  const row = await db
    .prepare(
      `SELECT
         id,
         title,
         remarks,
         updater,
         created_at,
         updated_at
       FROM practiceMenuHeader
       WHERE id = ?`
    )
    .bind(created.id)
    .first<PracticeMenuHeaderRow>();

  return row ? toPracticeMenuHeaderItem(row) : null;
};

export const updatePracticeMenuHeader = async (
  db: D1Database,
  id: number,
  input: PracticeMenuHeaderUpdateInput
): Promise<PracticeMenuHeaderWithDetailsItem | null> => {
  const title = normalizeNullableString(input.title);
  const remarks = normalizeNullableString(input.remarks);
  const updater = normalizeNullableString(input.updater);

  const updated = await db
    .prepare(
      `UPDATE practiceMenuHeader
       SET title = ?1,
           remarks = ?2,
           updater = ?3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?4
       RETURNING id`
    )
    .bind(title, remarks, updater, id)
    .first<{ id: number }>();

  if (!updated) {
    return null;
  }

  await db.prepare(`DELETE FROM practiceMenuDetail WHERE headerId = ?1`).bind(id).run();

  for (const detail of input.details ?? []) {
    await db
      .prepare(
        `INSERT INTO practiceMenuDetail (
           headerId,
           category,
           menuName,
           menuTime,
           timeWhite,
           startTime,
           endTime,
           sortNo,
           updater,
           created_at,
           updated_at
         )
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .bind(
        id,
        normalizeNullableString(detail.category),
        detail.menuName.trim(),
        detail.menuTime,
        normalizeNullableString(detail.timeWhite),
        normalizeNullableString(detail.startTime),
        normalizeNullableString(detail.endTime),
        detail.sortNo,
        normalizeNullableString(detail.updater)
      )
      .run();
  }

  return findPracticeMenuHeaderWithDetailsById(db, id);
};

export const findPracticeMenuHeaderWithDetailsById = async (
  db: D1Database,
  id: number
): Promise<PracticeMenuHeaderWithDetailsItem | null> => {
  const header = await db
    .prepare(
      `SELECT
         id,
         title,
         remarks,
         updater,
         created_at,
         updated_at
       FROM practiceMenuHeader
       WHERE id = ?1
       LIMIT 1`
    )
    .bind(id)
    .first<PracticeMenuHeaderRow>();

  if (!header) {
    return null;
  }

  const detailsResult = await db
    .prepare(
      `SELECT
         id,
         headerId AS header_id,
         category,
         menuName AS menu_name,
         menuTime AS menu_time,
         timeWhite AS time_white,
         startTime AS start_time,
         endTime AS end_time,
         sortNo AS sort_no,
         updater,
         created_at,
         updated_at
       FROM practiceMenuDetail
       WHERE headerId = ?1
       ORDER BY sortNo ASC, id ASC`
    )
    .bind(id)
    .all<PracticeMenuDetailRow>();

  return {
    ...toPracticeMenuHeaderItem(header),
    details: detailsResult.results.map(toPracticeMenuDetailItem),
  };
};
