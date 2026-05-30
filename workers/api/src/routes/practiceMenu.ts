import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import {
  createPracticeMenuHeader,
  findAllPracticeMenuHeaders,
  findPracticeMenuHeaderWithDetailsById,
  updatePracticeMenuHeader,
} from "../repositories/practiceMenuRepository";
import type { PracticeMenuDetailCreateInput, PracticeMenuHeaderCreateInput } from "../types/practiceMenu";

export const practiceMenuRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseNullableString = (value: unknown): string | null | undefined => {
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
};

const parsePracticeMenuHeaderInput = (body: unknown): PracticeMenuHeaderCreateInput | null => {
  if (!isRecord(body)) {
    return null;
  }

  const title = parseNullableString(body.title);
  const remarks = parseNullableString(body.remarks);
  const updater = parseNullableString(body.updater);
  const details = Array.isArray(body.details) ? body.details : [];

  if (title === undefined || remarks === undefined || updater === undefined) {
    return null;
  }

  const parsedDetails: PracticeMenuDetailCreateInput[] = [];
  for (let i = 0; i < details.length; i += 1) {
    const item = details[i];
    if (!isRecord(item)) {
      return null;
    }
    const category = parseNullableString(item.category);
    const menuName = typeof item.menuName === "string" ? item.menuName : undefined;
    const menuTimeRaw = item.menuTime;
    const timeWhite = item.timeWhite === undefined ? null : parseNullableString(item.timeWhite);
    const startTime = item.startTime === undefined ? null : parseNullableString(item.startTime);
    const endTime = item.endTime === undefined ? null : parseNullableString(item.endTime);
    const sortNoRaw = item.sortNo;
    const detailUpdater = parseNullableString(item.updater);

    if (
      category === undefined ||
      menuName === undefined ||
      menuTimeRaw === undefined ||
      timeWhite === undefined ||
      startTime === undefined ||
      endTime === undefined ||
      sortNoRaw === undefined ||
      detailUpdater === undefined
    ) {
      return null;
    }

    const menuTime =
      menuTimeRaw === null
        ? null
        : typeof menuTimeRaw === "number" && Number.isFinite(menuTimeRaw)
          ? menuTimeRaw
          : typeof menuTimeRaw === "string" && menuTimeRaw.trim()
            ? Number(menuTimeRaw)
            : undefined;
    const sortNo =
      typeof sortNoRaw === "number" && Number.isInteger(sortNoRaw)
        ? sortNoRaw
        : typeof sortNoRaw === "string" && sortNoRaw.trim()
          ? Number(sortNoRaw)
          : undefined;

    if (menuTime === undefined || Number.isNaN(menuTime) || sortNo === undefined || Number.isNaN(sortNo)) {
      return null;
    }

    parsedDetails.push({
      category,
      menuName,
      menuTime,
      timeWhite,
      startTime,
      endTime,
      sortNo,
      updater: detailUpdater,
    });
  }

  return { title, remarks, updater, details: parsedDetails };
};

practiceMenuRoutes.get("/practice-menu/headers", async (c) => {
  const headers = await findAllPracticeMenuHeaders(getDb(c.env));
  return c.json(headers);
});

practiceMenuRoutes.get("/practice-menu/headers/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Practice menu header id must be a positive integer",
        },
      },
      400
    );
  }

  const header = await findPracticeMenuHeaderWithDetailsById(getDb(c.env), id);
  if (!header) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Practice menu header not found",
        },
      },
      404
    );
  }

  return c.json(header);
});

practiceMenuRoutes.post("/practice-menu/headers", async (c) => {
  const body = await c.req.json().catch(() => null);
  const input = parsePracticeMenuHeaderInput(body);
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid practice menu header payload",
        },
      },
      400
    );
  }

  const created = await createPracticeMenuHeader(getDb(c.env), input);
  if (!created) {
    return c.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create practice menu header",
        },
      },
      500
    );
  }

  return c.json(created, 201);
});

practiceMenuRoutes.put("/practice-menu/headers/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Practice menu header id must be a positive integer",
        },
      },
      400
    );
  }

  const body = await c.req.json().catch(() => null);
  const input = parsePracticeMenuHeaderInput(body);
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid practice menu header payload",
        },
      },
      400
    );
  }

  const updated = await updatePracticeMenuHeader(getDb(c.env), id, input);
  if (!updated) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Practice menu header not found",
        },
      },
      404
    );
  }

  return c.json(updated);
});
