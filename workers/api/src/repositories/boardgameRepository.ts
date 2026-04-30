import type { BoardgameItem, BoardgameRow } from "../types/boardgame";

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
  updatedAt: row.updated_at
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
         updated_at
       FROM boardgames
       ORDER BY id ASC`
    )
    .all<BoardgameRow>();

  return result.results.map(toBoardgameItem);
};
