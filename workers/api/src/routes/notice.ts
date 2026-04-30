import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import { findNoticesByCurrentWindow } from "../repositories/noticeRepository";

export const noticeRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

noticeRoutes.get("/notices/current", async (c) => {
  const notices = await findNoticesByCurrentWindow(getDb(c.env));
  return c.json(notices);
});
