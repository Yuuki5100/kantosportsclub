import { Hono } from "hono";
import type { AppVariables, Bindings } from "../env";
import { findAllMedia } from "../repositories/mediaRepository";

export const mediaRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

mediaRoutes.get("/movies", async (c) => {
  const movies = await findAllMedia(
    c.env.DB,
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
  const pictures = await findAllMedia(c.env.DB, "pictures", {
    title: c.req.query("title"),
    description: c.req.query("description")
  });
  return c.json(pictures);
});
