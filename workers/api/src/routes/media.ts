import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import { createMedia, findAllMedia, updateMedia } from "../repositories/mediaRepository";
import type { MediaCreateInput, MediaUpdateInput } from "../types/media";

export const mediaRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

const parsePositiveInteger = (value: string | undefined): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseMediaUpdateInput = (body: unknown): MediaUpdateInput | null => {
  if (!isRecord(body)) {
    return null;
  }

  const { title, description } = body;

  if ((typeof title !== "string" && title !== null) || (typeof description !== "string" && description !== null)) {
    return null;
  }

  return { title, description };
};

const parseMediaCreateInput = (body: unknown): MediaCreateInput | null => {
  if (!isRecord(body)) {
    return null;
  }

  const { title, description } = body;
  if (typeof title !== "string" || typeof description !== "string") {
    return null;
  }

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  if (!trimmedTitle || !trimmedDescription) {
    return null;
  }

  return {
    title: trimmedTitle,
    description: trimmedDescription
  };
};

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

mediaRoutes.put("/movies/:id", async (c) => {
  const id = parsePositiveInteger(c.req.param("id"));
  if (id === null) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Movie id must be a positive integer"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const body = await c.req.json().catch(() => null);
  const input = parseMediaUpdateInput(body);
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "title and description must be string or null"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const movie = await updateMedia(getDb(c.env), "movies", id, input);
  if (!movie) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Movie not found"
        },
        requestId: c.get("requestId")
      },
      404
    );
  }

  return c.json(movie);
});

mediaRoutes.post("/movies", async (c) => {
  const body = await c.req.json().catch(() => null);
  const input = parseMediaCreateInput(body);
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "title and description are required"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const movie = await createMedia(getDb(c.env), "movies", input);
  if (!movie) {
    return c.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create movie"
        },
        requestId: c.get("requestId")
      },
      500
    );
  }

  return c.json(movie, 201);
});

mediaRoutes.get("/pictures", async (c) => {
  const pictures = await findAllMedia(getDb(c.env), "pictures", {
    title: c.req.query("title"),
    description: c.req.query("description")
  });
  return c.json(pictures);
});
