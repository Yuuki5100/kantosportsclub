import type {
  MediaCreateInput,
  MediaItem,
  MediaRow,
  MediaSearchFilter,
  MediaUpdateInput
} from "../types/media";

type MediaTable = "movies" | "pictures";
type MediaOrder = "idAsc" | "createdAtDesc";

type FindAllMediaOptions = {
  order?: MediaOrder;
};

const mediaOrderSql: Record<MediaOrder, string> = {
  idAsc: "id ASC",
  createdAtDesc: "created_at DESC, id DESC"
};

const mediaSelect = `
  SELECT
    id,
    title,
    description,
    url,
    location_id,
    created_at,
    updated_at
`;

const toMediaItem = (row: MediaRow): MediaItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  url: row.url,
  locationId: row.location_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const normalizeSearchText = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const escapeLikePattern = (value: string): string => value.replace(/[\\%_]/g, "\\$&");

const toHalfWidthAscii = (value: string): string =>
  value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  );

const toFullWidthAscii = (value: string): string =>
  value.replace(/[A-Za-z0-9]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 0xfee0)
  );

const buildLikePatterns = (value: string): string[] => {
  const variants = [value, toHalfWidthAscii(value), toFullWidthAscii(value)];
  return [...new Set(variants)].map((variant) => `%${escapeLikePattern(variant)}%`);
};

const appendLikeSearch = (
  conditions: string[],
  params: string[],
  columnName: "title" | "description",
  value: string | undefined
) => {
  if (!value) return;

  const patterns = buildLikePatterns(value);
  conditions.push(
    `(${patterns.map(() => `LOWER(${columnName}) LIKE LOWER(?) ESCAPE '\\'`).join(" OR ")})`
  );
  params.push(...patterns);
};

const buildMediaSearch = (filter?: MediaSearchFilter) => {
  const conditions: string[] = [];
  const params: string[] = [];
  const title = normalizeSearchText(filter?.title);
  const description = normalizeSearchText(filter?.description);

  appendLikeSearch(conditions, params, "title", title);
  appendLikeSearch(conditions, params, "description", description);

  return {
    whereSql: conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "",
    params
  };
};

export const findAllMedia = async (
  db: D1Database,
  table: MediaTable,
  filter?: MediaSearchFilter,
  options?: FindAllMediaOptions
): Promise<MediaItem[]> => {
  const search = buildMediaSearch(filter);
  const orderSql = mediaOrderSql[options?.order ?? "idAsc"];
  const statement = db.prepare(`${mediaSelect} FROM ${table}${search.whereSql} ORDER BY ${orderSql}`);
  const prepared = search.params.length > 0 ? statement.bind(...search.params) : statement;
  const result = await prepared.all<MediaRow>();

  return result.results.map(toMediaItem);
};

export const updateMedia = async (
  db: D1Database,
  table: MediaTable,
  id: number,
  input: MediaUpdateInput
): Promise<MediaItem | null> => {
  await db
    .prepare(`UPDATE ${table} SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(input.title, input.description, id)
    .run();

  const row = await db.prepare(`${mediaSelect} FROM ${table} WHERE id = ?`).bind(id).first<MediaRow>();

  return row ? toMediaItem(row) : null;
};

export const createMedia = async (
  db: D1Database,
  table: MediaTable,
  input: MediaCreateInput
): Promise<MediaItem | null> => {
  const row = await db
    .prepare(
      `INSERT INTO ${table} (title, description, location_id, created_at, updated_at)
       VALUES (?, ?, '1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, title, description, url, location_id, created_at, updated_at`
    )
    .bind(input.title, input.description)
    .first<MediaRow>();

  return row ? toMediaItem(row) : null;
};
