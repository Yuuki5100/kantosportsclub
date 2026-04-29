import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import { getSchemaVersion, pingD1 } from "../db/d1";

export const healthRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

healthRoutes.get("/", async (c) => {
  const d1 = getDb(c.env);
  const db = await pingD1(d1);
  const schemaVersion = await getSchemaVersion(d1);

  return c.json({
    status: "ok",
    worker: "kantosportsclub-api",
    db,
    schemaVersion,
    requestId: c.get("requestId")
  });
});
