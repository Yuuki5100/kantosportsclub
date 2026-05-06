import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import { createNotice, findNoticeById, findNoticesByCurrentWindow, updateNotice } from "../repositories/noticeRepository";
import type { NoticeCreateInput, NoticeUpdateInput } from "../types/notice";

export const noticeRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

noticeRoutes.get("/notices/current", async (c) => {
  const notices = await findNoticesByCurrentWindow(getDb(c.env));
  return c.json(notices);
});

const parseNoticeId = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

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

const parseNullableString = (value: unknown): string | null | undefined => {
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
};

const parseNoticeUpdateInput = (body: unknown): NoticeUpdateInput | null => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const title = parseNullableString(record.title);
  const station = parseNullableString(record.station);
  const locationId = parseNullableNumber(record.locationId);
  const dateandtime = parseNullableString(record.dateandtime);
  const people = parseNullableNumber(record.people);
  const peopleName = parseNullableString(record.peopleName);
  const remarks = parseNullableString(record.remarks);
  const publicAt = parseNullableString(record.publicAt);
  const closedAt = parseNullableString(record.closedAt);
  const startHour = parseNullableString(record.startHour);
  const endHour = parseNullableString(record.endHour);
  const money = parseNullableString(record.money);

  if (
    title === undefined ||
    station === undefined ||
    locationId === undefined ||
    dateandtime === undefined ||
    people === undefined ||
    peopleName === undefined ||
    remarks === undefined ||
    publicAt === undefined ||
    closedAt === undefined ||
    startHour === undefined ||
    endHour === undefined ||
    money === undefined
  ) {
    return null;
  }

  return { title, station, locationId, dateandtime, people, peopleName, remarks, publicAt, closedAt, startHour, endHour, money };
};

const parseNoticeCreateInput = parseNoticeUpdateInput;

noticeRoutes.get("/notice/notice_id", async (c) => {
  const noticeId = parseNoticeId(c.req.query("notice_id") ?? undefined);
  if (noticeId === null) {
    return c.json({ error: { code: "BAD_REQUEST", message: "notice_id must be a positive integer" } }, 400);
  }

  const notice = await findNoticeById(getDb(c.env), noticeId);
  if (!notice) {
    return c.json({ error: { code: "NOT_FOUND", message: "Notice not found" } }, 404);
  }

  return c.json(notice);
});

noticeRoutes.put("/notice/notice_id", async (c) => {
  const noticeId = parseNoticeId(c.req.query("notice_id") ?? undefined);
  if (noticeId === null) {
    return c.json({ error: { code: "BAD_REQUEST", message: "notice_id must be a positive integer" } }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const input = parseNoticeUpdateInput(body);
  if (!input) {
    return c.json({ error: { code: "BAD_REQUEST", message: "Invalid notice payload" } }, 400);
  }

  const updated = await updateNotice(getDb(c.env), noticeId, input);
  if (!updated) {
    return c.json({ error: { code: "NOT_FOUND", message: "Notice not found" } }, 404);
  }

  return c.json(updated);
});

noticeRoutes.post("/notice/create", async (c) => {
  const body = await c.req.json().catch(() => null);
  const input = parseNoticeCreateInput(body);
  if (!input) {
    return c.json({ error: { code: "BAD_REQUEST", message: "Invalid notice payload" } }, 400);
  }

  const created = await createNotice(getDb(c.env), input as NoticeCreateInput);
  if (!created) {
    return c.json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to create notice" } }, 500);
  }

  return c.json({ noticeId: created.id }, 201);
});
