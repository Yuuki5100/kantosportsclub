import type { CommunityCreateInput, CommunityItem, CommunityRow, CommunitySearchFilter } from "../types/community";

const normalize = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed || undefined;
};

const escapeLike = (value: string): string => value.replace(/[\\%_]/g, "\\$&");

const toCommunityItem = (row: CommunityRow): CommunityItem => ({
  id: row.id,
  title: row.title,
  url: row.url,
  note: row.note,
  label: row.label,
  author: row.author,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findAllCommunities = async (
  db: D1Database,
  filter?: CommunitySearchFilter,
): Promise<CommunityItem[]> => {
  const conditions: string[] = [];
  const params: string[] = [];
  const title = normalize(filter?.title);
  const label = normalize(filter?.label);
  const author = normalize(filter?.author);

  if (title) {
    conditions.push("LOWER(title) LIKE LOWER(?) ESCAPE '\\'");
    params.push(`%${escapeLike(title)}%`);
  }
  if (label) {
    conditions.push("LOWER(label) LIKE LOWER(?) ESCAPE '\\'");
    params.push(`%${escapeLike(label)}%`);
  }
  if (author) {
    conditions.push("author = ?");
    params.push(author);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const statement = db.prepare(`
    SELECT id, title, url, note, label, author, created_at, updated_at
    FROM communities
    ${whereSql}
    ORDER BY updated_at DESC, id DESC
  `);
  const result = params.length > 0 ? await statement.bind(...params).all<CommunityRow>() : await statement.all<CommunityRow>();
  return result.results.map(toCommunityItem);
};

export const createCommunity = async (
  db: D1Database,
  input: CommunityCreateInput,
): Promise<CommunityItem | null> => {
  const created = await db.prepare(
    `INSERT INTO communities (title, url, note, label, author, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id`,
  ).bind(input.title, input.url, input.note, input.label, input.author).first<{ id: number }>();

  if (!created) return null;
  const row = await db.prepare(
    `SELECT id, title, url, note, label, author, created_at, updated_at
     FROM communities WHERE id = ?`,
  ).bind(created.id).first<CommunityRow>();
  return row ? toCommunityItem(row) : null;
};

export const findCommunityById = async (db: D1Database, id: number): Promise<CommunityItem | null> => {
  const row = await db.prepare(
    `SELECT id, title, url, note, label, author, created_at, updated_at FROM communities WHERE id = ?`,
  ).bind(id).first<CommunityRow>();
  return row ? toCommunityItem(row) : null;
};

export const updateCommunity = async (db: D1Database, id: number, input: Omit<CommunityCreateInput, "author">): Promise<CommunityItem | null> => {
  const result = await db.prepare(
    `UPDATE communities SET title = ?, url = ?, note = ?, label = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING id`,
  ).bind(input.title, input.url, input.note, input.label, id).first<{ id: number }>();
  return result ? findCommunityById(db, result.id) : null;
};

export const deleteCommunity = async (db: D1Database, id: number): Promise<boolean> => {
  const result = await db.prepare("DELETE FROM communities WHERE id = ?").bind(id).run();
  return (result.meta.changes ?? 0) > 0;
};
