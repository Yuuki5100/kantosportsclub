import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import { findAllBoardgames } from "../repositories/boardgameRepository";

export const boardgameRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

boardgameRoutes.get("/boardgames", async (c) => {
  const boardgames = await findAllBoardgames(getDb(c.env));
  return c.json(boardgames);
});
