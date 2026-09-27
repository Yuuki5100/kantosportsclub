import type { PracticeMovieCreateInput, PracticeMovieItem, PracticeMovieRow, PracticeMovieSearchFilter } from "../types/practiceMovies";

const normalize = (value: string | undefined) => value?.trim() || undefined;
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");
const toItem = (row: PracticeMovieRow): PracticeMovieItem => ({ id: row.id, title: row.title, url: row.url, note: row.note, label: row.label, author: row.author, createdAt: row.created_at, updatedAt: row.updated_at });
const select = "SELECT id, title, url, note, label, author, created_at, updated_at FROM practiceMovies";

export const findAllPracticeMovies = async (db: D1Database, filter?: PracticeMovieSearchFilter): Promise<PracticeMovieItem[]> => {
  const conditions: string[] = [];
  const params: string[] = [];
  const title = normalize(filter?.title);
  const label = normalize(filter?.label);
  const author = normalize(filter?.author);
  if (title) { conditions.push("LOWER(title) LIKE LOWER(?) ESCAPE '\\'"); params.push(`%${escapeLike(title)}%`); }
  if (label) { conditions.push("LOWER(label) LIKE LOWER(?) ESCAPE '\\'"); params.push(`%${escapeLike(label)}%`); }
  if (author) { conditions.push("author = ?"); params.push(author); }
  const statement = db.prepare(`${select} ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""} ORDER BY updated_at DESC, id DESC`);
  const result = params.length ? await statement.bind(...params).all<PracticeMovieRow>() : await statement.all<PracticeMovieRow>();
  return result.results.map(toItem);
};

export const findPracticeMovieById = async (db: D1Database, id: number) => {
  const row = await db.prepare(`${select} WHERE id = ?`).bind(id).first<PracticeMovieRow>();
  return row ? toItem(row) : null;
};
export const createPracticeMovie = async (db: D1Database, input: PracticeMovieCreateInput) => {
  const created = await db.prepare("INSERT INTO practiceMovies (title, url, note, label, author, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id").bind(input.title, input.url, input.note, input.label, input.author).first<{ id: number }>();
  return created ? findPracticeMovieById(db, created.id) : null;
};
export const updatePracticeMovie = async (db: D1Database, id: number, input: Omit<PracticeMovieCreateInput, "author">) => {
  const result = await db.prepare("UPDATE practiceMovies SET title = ?, url = ?, note = ?, label = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING id").bind(input.title, input.url, input.note, input.label, id).first<{ id: number }>();
  return result ? findPracticeMovieById(db, result.id) : null;
};
export const deletePracticeMovie = async (db: D1Database, id: number) => {
  const result = await db.prepare("DELETE FROM practiceMovies WHERE id = ?").bind(id).run();
  return (result.meta.changes ?? 0) > 0;
};
