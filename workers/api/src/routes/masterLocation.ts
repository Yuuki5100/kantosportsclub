import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import { findAllMasterLocations } from "../repositories/masterLocationRepository";

export const masterLocationRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

masterLocationRoutes.get("/master_locations", async (c) => {
  const locations = await findAllMasterLocations(getDb(c.env));
  return c.json(locations);
});
