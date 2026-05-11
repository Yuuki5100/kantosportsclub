import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import {
  findMypageByUserIdWithPublicImageUrl,
  upsertMypageWithPublicImageUrl,
} from "../repositories/mypageRepository";
import type { MypageUpsertInput } from "../types/mypage";

export const mypageRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

const parsePositiveInteger = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseNullableString = (value: unknown): string | null | undefined => {
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
};

const MAX_IMAGE_URL_LENGTH = 512;

const isPersistableImageUrl = (value: string | null | undefined): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  return trimmed.length <= MAX_IMAGE_URL_LENGTH && !trimmed.startsWith("data:");
};

const parseMypageInput = (body: unknown): MypageUpsertInput | null => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const userName = parseNullableString(record.userName);
  const enthusiasm = parseNullableString(record.enthusiasm);
  const hopeStyle = parseNullableString(record.hopeStyle);
  const remarks = parseNullableString(record.remarks);
  const imageUrl = parseNullableString(record.imageUrl ?? record.image_url);

  if (
    userName === undefined ||
    enthusiasm === undefined ||
    hopeStyle === undefined ||
    remarks === undefined ||
    imageUrl === undefined
  ) {
    return null;
  }

  if (!isPersistableImageUrl(imageUrl)) {
    return null;
  }

  return { userName, enthusiasm, hopeStyle, remarks, imageUrl };
};

mypageRoutes.get("/mypage/:user_id", async (c) => {
  const userId = parsePositiveInteger(c.req.param("user_id"));
  if (userId === null) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "user_id must be a positive integer",
        },
        requestId: c.get("requestId"),
      },
      400
    );
  }

  const mypage = await findMypageByUserIdWithPublicImageUrl(getDb(c.env), userId, c.env.R2_PUBLIC_BASE_URL);
  if (!mypage) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "mypage not found",
        },
        requestId: c.get("requestId"),
      },
      404
    );
  }

  return c.json(mypage);
});

mypageRoutes.put("/mypage/:user_id", async (c) => {
  const userId = parsePositiveInteger(c.req.param("user_id"));
  if (userId === null) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "user_id must be a positive integer",
        },
        requestId: c.get("requestId"),
      },
      400
    );
  }

  const body = await c.req.json().catch(() => null);
  const input = parseMypageInput(body);
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid mypage payload",
        },
        requestId: c.get("requestId"),
      },
      400
    );
  }

  const mypage = await upsertMypageWithPublicImageUrl(getDb(c.env), userId, input, c.env.R2_PUBLIC_BASE_URL);
  if (!mypage) {
    return c.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save mypage",
        },
        requestId: c.get("requestId"),
      },
      500
    );
  }

  return c.json(mypage);
});
