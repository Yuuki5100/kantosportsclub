import type { NoticeCreateInput, NoticeItem, NoticeUpdateInput } from "../types/notice";

type NoticeRow = {
  id: number;
  title: string | null;
  station: string | null;
  location_id: number | null;
  location_name: string | null;
  people: number | null;
  people_name: string | null;
  remarks: string | null;
  public_at: string | null;
  closed_at: string | null;
  start_hour: string | null;
  end_hour: string | null;
  money: string | null;
};

const toNoticeItem = (row: NoticeRow): NoticeItem => ({
  id: row.id,
  title: row.title,
  station: row.station,
  locationId: row.location_id,
  locationName: row.location_name,
  people: row.people,
  peopleName: row.people_name,
  remarks: row.remarks,
  publicAt: row.public_at,
  closedAt: row.closed_at,
  startHour: row.start_hour,
  endHour: row.end_hour,
  money: row.money
});

const isNumberOrNull = (value: unknown): value is number | null =>
  value === null || (typeof value === "number" && Number.isFinite(value));

const isStringOrNull = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

export const findNoticeById = async (db: D1Database, id: number): Promise<NoticeItem | null> => {
  const result = await db
    .prepare(
      `SELECT
         id,
         title,
         station,
         n.location_id AS location_id,
         ml.location_name AS location_name,
         people,
         people_name,
         remarks,
         public_at,
         closed_at,
         start_hour,
         end_hour,
         money
       FROM notices n
       LEFT JOIN master_locations ml ON ml.location_id = n.location_id
       WHERE n.id = ?1
       LIMIT 1`
    )
    .bind(id)
    .first<NoticeRow>();

  return result ? toNoticeItem(result) : null;
};

export const updateNotice = async (
  db: D1Database,
  id: number,
  input: NoticeUpdateInput
): Promise<NoticeItem | null> => {
  const locationId = isNumberOrNull(input.locationId) ? input.locationId : null;
  const people = isNumberOrNull(input.people) ? input.people : null;
  const title = isStringOrNull(input.title) ? input.title : null;
  const station = isStringOrNull(input.station) ? input.station : null;
  const peopleName = isStringOrNull(input.peopleName) ? input.peopleName : null;
  const remarks = isStringOrNull(input.remarks) ? input.remarks : null;
  const publicAt = isStringOrNull(input.publicAt) ? input.publicAt : null;
  const closedAt = isStringOrNull(input.closedAt) ? input.closedAt : null;
  const startHour = isStringOrNull(input.startHour) ? input.startHour : null;
  const endHour = isStringOrNull(input.endHour) ? input.endHour : null;
  const money = isStringOrNull(input.money) ? input.money : null;

  const exists = await db.prepare("SELECT id FROM notices WHERE id = ?1").bind(id).first<{ id: number }>();
  if (!exists) {
    return null;
  }

  await db
    .prepare(
      `UPDATE notices
       SET title = ?1,
           station = ?2,
           location_id = ?3,
           people = ?4,
           people_name = ?5,
           remarks = ?6,
           public_at = ?7,
           closed_at = ?8,
           start_hour = ?9,
           end_hour = ?10,
           money = ?11
       WHERE id = ?12`
    )
    .bind(
      title,
      station,
      locationId,
      people,
      peopleName,
      remarks,
      publicAt,
      closedAt,
      startHour,
      endHour,
      money,
      id
    )
    .run();

  return findNoticeById(db, id);
};

export const createNotice = async (
  db: D1Database,
  input: NoticeCreateInput
): Promise<NoticeItem | null> => {
  const locationId = isNumberOrNull(input.locationId) ? input.locationId : null;
  const people = isNumberOrNull(input.people) ? input.people : null;
  const title = isStringOrNull(input.title) ? input.title : null;
  const station = isStringOrNull(input.station) ? input.station : null;
  const peopleName = isStringOrNull(input.peopleName) ? input.peopleName : null;
  const remarks = isStringOrNull(input.remarks) ? input.remarks : null;
  const publicAt = isStringOrNull(input.publicAt) ? input.publicAt : null;
  const closedAt = isStringOrNull(input.closedAt) ? input.closedAt : null;
  const startHour = isStringOrNull(input.startHour) ? input.startHour : null;
  const endHour = isStringOrNull(input.endHour) ? input.endHour : null;
  const money = isStringOrNull(input.money) ? input.money : null;

  const result = await db
    .prepare(
      `INSERT INTO notices (
         title,
         station,
         location_id,
         people,
         people_name,
         remarks,
         public_at,
         closed_at,
         start_hour,
         end_hour,
         money
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
    )
    .bind(
      title,
      station,
      locationId,
      people,
      peopleName,
      remarks,
      publicAt,
      closedAt,
      startHour,
      endHour,
      money
    )
    .run();

  const noticeId = Number(result.meta.last_row_id);
  if (!Number.isFinite(noticeId) || noticeId <= 0) {
    return null;
  }

  return findNoticeById(db, noticeId);
};

export const findNoticesByCurrentWindow = async (db: D1Database): Promise<NoticeItem[]> => {
  const result = await db
    .prepare(
      `SELECT
         id,
         title,
         station,
         n.location_id,
         ml.location_name AS location_name,
         people,
         people_name,
         remarks,
         public_at,
         closed_at,
         start_hour,
         end_hour,
         money
       FROM notices n
       LEFT JOIN master_locations ml ON ml.location_id = n.location_id
       WHERE public_at <= CURRENT_TIMESTAMP
         AND closed_at > CURRENT_TIMESTAMP
       ORDER BY n.public_at ASC, n.id ASC`
    )
    .all<NoticeRow>();

  return result.results.map(toNoticeItem);
};
