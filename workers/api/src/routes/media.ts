import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import { findAllMedia } from "../repositories/mediaRepository";

export const mediaRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

mediaRoutes.get("/movies", async (c) => {
  const movies = await findAllMedia(
    getDb(c.env),
    "movies",
    {
      title: c.req.query("title"),
      description: c.req.query("description")
    },
    { order: "createdAtDesc" }
  );
  return c.json(movies);
});

mediaRoutes.get("/pictures", async (c) => {
  const pictures = await findAllMedia(getDb(c.env), "pictures", {
    title: c.req.query("title"),
    description: c.req.query("description")
  });
  return c.json(pictures);
});
