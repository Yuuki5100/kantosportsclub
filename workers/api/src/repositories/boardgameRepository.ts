import type {
  BoardgameCreateInput,
  BoardgameItem,
  BoardgameRow,
  BoardgameSearchFilter
} from "../types/boardgame";

const toBoardgameItem = (row: BoardgameRow): BoardgameItem => ({
  id: row.id,
  boardgameName: row.boardgame_name,
  ownerName: row.owner_name,
  peopleMin: row.people_min,
  peopleMax: row.people_max,
  needTime: row.need_time,
  urlStr: row.url_str,
  howToPlay: row.how_to_play,
  remarks: row.remarks,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  imageUrl1: row.image_url1,
  imageUrl2: row.image_url2
});

export const findAllBoardgames = async (db: D1Database): Promise<BoardgameItem[]> => {
  const result = await db
    .prepare(
      `SELECT
         id,
         boardgame_name,
         owner_name,
         people_min,
         people_max,
         need_time,
         url_str,
         how_to_play,
         remarks,
         created_at,
         updated_at,
         image_url1,
         image_url2
       FROM boardgames
       ORDER BY id ASC`
    )
    .all<BoardgameRow>();

  return result.results.map(toBoardgameItem);
};

export const createBoardgame = async (
  db: D1Database,
  input: BoardgameCreateInput
): Promise<BoardgameItem | null> => {
  const created = await db
    .prepare(
      `INSERT INTO boardgames (
         boardgame_name,
         owner_name,
         people_min,
         people_max,
         need_time,
         url_str,
         how_to_play,
         remarks,
         created_at,
         updated_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`
    )
    .bind(
      input.boardgameName,
      input.ownerName,
      input.peopleMin,
      input.peopleMax,
      input.needTime,
      input.urlStr,
      input.howToPlay,
      input.remarks
    )
    .first<{ id: number }>();

  if (!created) {
    return null;
  }

  const row = await db
    .prepare(
      `SELECT
         id,
         boardgame_name,
         owner_name,
         people_min,
         people_max,
         need_time,
         url_str,
         how_to_play,
         remarks,
         created_at,
         updated_at,
         image_url1,
         image_url2
       FROM boardgames
       WHERE id = ?`
    )
    .bind(created.id)
    .first<BoardgameRow>();

  return row ? toBoardgameItem(row) : null;
};

export const updateBoardgame = async (
  db: D1Database,
  id: number,
  input: BoardgameCreateInput
): Promise<BoardgameItem | null> => {
  const updated = await db
    .prepare(
      `UPDATE boardgames
       SET boardgame_name = ?,
           owner_name = ?,
           people_min = ?,
           people_max = ?,
           need_time = ?,
           url_str = ?,
           how_to_play = ?,
           remarks = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       RETURNING id`
    )
    .bind(
      input.boardgameName,
      input.ownerName,
      input.peopleMin,
      input.peopleMax,
      input.needTime,
      input.urlStr,
      input.howToPlay,
      input.remarks,
      id
    )
    .first<{ id: number }>();

  if (!updated) {
    return null;
  }

  const row = await db
    .prepare(
      `SELECT
         id,
         boardgame_name,
         owner_name,
         people_min,
         people_max,
         need_time,
         url_str,
         how_to_play,
         remarks,
         created_at,
         updated_at,
         image_url1,
         image_url2
       FROM boardgames
       WHERE id = ?`
    )
    .bind(id)
    .first<BoardgameRow>();

  return row ? toBoardgameItem(row) : null;
};

const normalizeSearchText = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const parsePositiveInteger = (value: string | undefined): number | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

export const findBoardgames = async (
  db: D1Database,
  filter: BoardgameSearchFilter
): Promise<BoardgameItem[]> => {
  const conditions: string[] = [];
  const params: unknown[] = [];

  const boardgameName = normalizeSearchText(filter.boardgameName);
  const ownerName = normalizeSearchText(filter.ownerName);
  const people = parsePositiveInteger(filter.people);
  const needTime = parsePositiveInteger(filter.needTime);

  if (boardgameName) {
    conditions.push("boardgame_name LIKE ?");
    params.push(`%${boardgameName}%`);
  }

  if (ownerName) {
    conditions.push("owner_name LIKE ?");
    params.push(`%${ownerName}%`);
  }

  if (people !== undefined) {
    conditions.push("? BETWEEN people_min AND people_max");
    params.push(people);
  }

  if (needTime !== undefined) {
    conditions.push("need_time <= ?");
    params.push(needTime);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const orderSql =
    people !== undefined
      ? "people_max DESC, people_min DESC, id ASC"
      : needTime !== undefined
        ? "need_time DESC, id ASC"
        : "id ASC";

  const statement = db.prepare(
    `SELECT
       id,
       boardgame_name,
       owner_name,
       people_min,
       people_max,
       need_time,
       url_str,
       how_to_play,
       remarks,
       created_at,
       updated_at,
       image_url1,
       image_url2
     FROM boardgames
     ${whereSql}
     ORDER BY ${orderSql}`
  );

  const result =
    params.length > 0
      ? await statement.bind(...params).all<BoardgameRow>()
      : await statement.all<BoardgameRow>();

  return result.results.map(toBoardgameItem);
};
