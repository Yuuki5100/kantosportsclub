import { Hono } from "hono";
import type { AppVariables, Bindings } from "../env";
import { getSchemaVersion, pingD1 } from "../db/d1";

export const healthRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

healthRoutes.get("/", async (c) => {
  const db = await pingD1(c.env.DB);
  const schemaVersion = await getSchemaVersion(c.env.DB);

  return c.json({
    status: "ok",
    worker: "kantosportsclub-api",
    db,
    schemaVersion,
    requestId: c.get("requestId")
  });
});
