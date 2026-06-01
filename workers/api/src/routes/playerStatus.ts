import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import {
  createPlayerStatus,
  findAllPlayerStatuses,
  findPlayerStatusById,
  findPlayerStatusByUserIdAndReviewUserId,
  findPlayerStatusesByUserId,
  updatePlayerStatusByUserIdAndReviewUserId,
} from "../repositories/playerStatusRepository";
import type { PlayerStatusCreateInput, PlayerStatusUpdateInput } from "../types/playerStatus";

export const playerStatusRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseNullableNumber = (value: unknown): number | null | undefined => {
  if (value === null) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const parseRequiredNumber = (value: unknown): number | undefined => {
  const parsed = parseNullableNumber(value);
  return typeof parsed === "number" ? parsed : undefined;
};

const parseNullableString = (value: unknown): string | null | undefined => {
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return undefined;
};

const parsePlayerStatusInput = (body: unknown): PlayerStatusCreateInput | null => {
  if (!isRecord(body)) {
    return null;
  }

  const userId = parseRequiredNumber(body.userId);
  const reviewUserId = parseRequiredNumber(body.reviewUserId);
  const shooting = parseNullableNumber(body.shooting);
  const dribbling = parseNullableNumber(body.dribbling);
  const passing = parseNullableNumber(body.passing);
  const defense = parseNullableNumber(body.defense);
  const stamina = parseNullableNumber(body.stamina);
  const remarks = parseNullableString(body.remarks);

  if (
    userId === undefined ||
    reviewUserId === undefined ||
    shooting === undefined ||
    dribbling === undefined ||
    passing === undefined ||
    defense === undefined ||
    stamina === undefined ||
    remarks === undefined
  ) {
    return null;
  }

  return {
    userId,
    reviewUserId,
    shooting,
    dribbling,
    passing,
    defense,
    stamina,
    remarks,
  };
};

const parsePlayerStatusId = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseUserId = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getCurrentAuthUserId = (c: { get: (key: "auth") => { user?: { userId?: string | null } | null } | null | undefined }): number | null => {
  const authUserId = c.get("auth")?.user?.userId;
  if (!authUserId) {
    return null;
  }
  const parsed = Number(authUserId);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

playerStatusRoutes.get("/player-status", async (c) => {
  const items = await findAllPlayerStatuses(getDb(c.env));
  return c.json(items);
});

playerStatusRoutes.get("/player-status/:id", async (c) => {
  const id = parsePlayerStatusId(c.req.param("id"));
  if (id === null) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "player status id must be a positive integer",
        },
      },
      400
    );
  }

  const item = await findPlayerStatusById(getDb(c.env), id);
  if (!item) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Player status not found",
        },
      },
      404
    );
  }

  return c.json(item);
});

playerStatusRoutes.get("/player-status/user/:user_id", async (c) => {
  const userId = parseUserId(c.req.param("user_id"));
  if (userId === null) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "player status user id must be a positive integer",
        },
      },
      400
    );
  }

  const reviewUserId = getCurrentAuthUserId(c);
  if (reviewUserId === null) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      401
    );
  }

  const item = await findPlayerStatusByUserIdAndReviewUserId(getDb(c.env), userId, reviewUserId);
  if (!item) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Player status not found",
        },
      },
      404
    );
  }

  return c.json(item);
});

playerStatusRoutes.get("/player-status/user/:user_id/records", async (c) => {
  const userId = parseUserId(c.req.param("user_id"));
  if (userId === null) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "player status user id must be a positive integer",
        },
      },
      400
    );
  }

  const items = await findPlayerStatusesByUserId(getDb(c.env), userId);
  return c.json(items);
});

playerStatusRoutes.post("/player-status", async (c) => {
  const body = await c.req.json().catch(() => null);
  const input = parsePlayerStatusInput(body);
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid player status payload",
        },
      },
      400
    );
  }

  const created = await createPlayerStatus(getDb(c.env), input);
  if (!created) {
    return c.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create player status",
        },
      },
      500
    );
  }

  return c.json(created, 201);
});

playerStatusRoutes.put("/player-status/user/:user_id", async (c) => {
  const userId = parseUserId(c.req.param("user_id"));
  if (userId === null) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "player status user id must be a positive integer",
        },
      },
      400
    );
  }

  const reviewUserId = getCurrentAuthUserId(c);
  if (reviewUserId === null) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      401
    );
  }

  const body = await c.req.json().catch(() => null);
  const input = parsePlayerStatusInput(body) as PlayerStatusUpdateInput | null;
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid player status payload",
        },
      },
      400
    );
  }

  const updated = await updatePlayerStatusByUserIdAndReviewUserId(getDb(c.env), userId, reviewUserId, input);
  if (!updated) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Player status not found",
        },
      },
      404
    );
  }

  return c.json(updated);
});
