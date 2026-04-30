import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import { findAllBoardgames, findBoardgames } from "../repositories/boardgameRepository";

export const boardgameRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

boardgameRoutes.get("/boardgames", async (c) => {
  const boardgames = await findAllBoardgames(getDb(c.env));
  return c.json(boardgames);
});

boardgameRoutes.post("/boardgames", async (c) => {
  const result = await findBoardgames(getDb(c.env), {
    boardgameName: c.req.query("boardgameName"),
    people: c.req.query("people"),
    needTime: c.req.query("needTime"),
    ownerName: c.req.query("ownerName"),
  });

  return c.json(result);
});