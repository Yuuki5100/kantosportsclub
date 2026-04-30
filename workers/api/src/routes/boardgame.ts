import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import {
  createBoardgame,
  findAllBoardgames,
  findBoardgames,
  updateBoardgame
} from "../repositories/boardgameRepository";
import type { BoardgameCreateInput } from "../types/boardgame";

export const boardgameRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseNullableString = (value: unknown): string | null | undefined => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (value === null) {
    return null;
  }
  return undefined;
};

const parseNullablePositiveInteger = (value: unknown): number | null | undefined => {
  if (value === null) {
    return null;
  }
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  }
  return undefined;
};

const parseBoardgameCreateInput = (body: unknown): BoardgameCreateInput | null => {
  if (!isRecord(body)) {
    return null;
  }

  const boardgameName = parseNullableString(body.boardgameName);
  const ownerName = parseNullableString(body.ownerName);
  const peopleMin = parseNullablePositiveInteger(body.peopleMin);
  const peopleMax = parseNullablePositiveInteger(body.peopleMax);
  const needTime = parseNullablePositiveInteger(body.needTime);
  const urlStr = parseNullableString(body.urlStr);
  const howToPlay = parseNullableString(body.howToPlay);
  const remarks = parseNullableString(body.remarks);

  if (
    boardgameName === undefined ||
    ownerName === undefined ||
    peopleMin === undefined ||
    peopleMax === undefined ||
    needTime === undefined ||
    urlStr === undefined ||
    howToPlay === undefined ||
    remarks === undefined
  ) {
    return null;
  }

  return {
    boardgameName,
    ownerName,
    peopleMin,
    peopleMax,
    needTime,
    urlStr,
    howToPlay,
    remarks
  };
};

boardgameRoutes.get("/boardgames", async (c) => {
  const boardgames = await findAllBoardgames(getDb(c.env));
  return c.json(boardgames);
});

boardgameRoutes.post("/boardgames", async (c) => {
  const body = await c.req.json().catch(() => null);
  const input = parseBoardgameCreateInput(body);
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid boardgame payload"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const boardgame = await createBoardgame(getDb(c.env), input);
  if (!boardgame) {
    return c.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create boardgame"
        },
        requestId: c.get("requestId")
      },
      500
    );
  }

  return c.json(boardgame, 201);
});

boardgameRoutes.put("/boardgames/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Boardgame id must be a positive integer"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const body = await c.req.json().catch(() => null);
  const input = parseBoardgameCreateInput(body);
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid boardgame payload"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const boardgame = await updateBoardgame(getDb(c.env), id, input);
  if (!boardgame) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Boardgame not found"
        },
        requestId: c.get("requestId")
      },
      404
    );
  }

  return c.json(boardgame);
});

boardgameRoutes.get("/boardgames/search", async (c) => {
  const result = await findBoardgames(getDb(c.env), {
    boardgameName: c.req.query("boardgameName"),
    people: c.req.query("people"),
    needTime: c.req.query("needTime"),
    ownerName: c.req.query("ownerName"),
  });

  return c.json(result);
});
