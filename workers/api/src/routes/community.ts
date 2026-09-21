import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import { createCommunity, deleteCommunity, findAllCommunities, findCommunityById, updateCommunity } from "../repositories/communityRepository";
import type { CommunityCreateInput } from "../types/community";

export const communityRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

const parseId = (value: string): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};


communityRoutes.get("/communities", async (c) => {
  const communities = await findAllCommunities(getDb(c.env), {
    title: c.req.query("title"),
    label: c.req.query("label"),
  });

  return c.json(communities);
});

communityRoutes.get("/communities/mine", async (c) => {
  const auth = c.get("auth");
  const author = auth?.user?.displayName?.trim() || auth?.user?.userId?.trim();
  if (!auth?.authenticated || !author) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" }, requestId: c.get("requestId") }, 401);
  }
  return c.json(await findAllCommunities(getDb(c.env), { author }));
});

communityRoutes.get("/communities/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) return c.json({ error: { code: "BAD_REQUEST", message: "Invalid community id" } }, 400);
  const community = await findCommunityById(getDb(c.env), id);
  return community ? c.json(community) : c.json({ error: { code: "NOT_FOUND", message: "Community not found" } }, 404);
});

communityRoutes.put("/communities/:id", async (c) => {
  const auth = c.get("auth");
  const author = auth?.user?.displayName?.trim() || auth?.user?.userId?.trim() || null;
  const id = parseId(c.req.param("id"));
  if (!auth?.authenticated || !author) return c.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401);
  if ((auth.roleLevel ?? 0) < 2) return c.json({ error: { code: "FORBIDDEN", message: "Insufficient permission" } }, 403);
  if (id === null) return c.json({ error: { code: "BAD_REQUEST", message: "Invalid community id" } }, 400);
  const current = await findCommunityById(getDb(c.env), id);
  if (!current) return c.json({ error: { code: "NOT_FOUND", message: "Community not found" } }, 404);
  if (current.author !== author) return c.json({ error: { code: "FORBIDDEN", message: "Only the author can update this community" } }, 403);
  const body = await c.req.json().catch(() => null) as Partial<CommunityCreateInput> | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() || null : null;
  if (!title || !url || !label) return c.json({ error: { code: "BAD_REQUEST", message: "title, url and label are required" } }, 400);
  const updated = await updateCommunity(getDb(c.env), id, { title, url, note, label });
  return updated ? c.json(updated) : c.json({ error: { code: "NOT_FOUND", message: "Community not found" } }, 404);
});

communityRoutes.delete("/communities/:id", async (c) => {
  const auth = c.get("auth");
  const author = auth?.user?.displayName?.trim() || auth?.user?.userId?.trim() || null;
  const id = parseId(c.req.param("id"));
  if (!auth?.authenticated || !author) return c.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401);
  if ((auth.roleLevel ?? 0) < 2) return c.json({ error: { code: "FORBIDDEN", message: "Insufficient permission" } }, 403);
  if (id === null) return c.json({ error: { code: "BAD_REQUEST", message: "Invalid community id" } }, 400);
  const current = await findCommunityById(getDb(c.env), id);
  if (!current) return c.json({ error: { code: "NOT_FOUND", message: "Community not found" } }, 404);
  if (current.author !== author) return c.json({ error: { code: "FORBIDDEN", message: "Only the author can delete this community" } }, 403);
  await deleteCommunity(getDb(c.env), id);
  return c.json({ success: true });
});

communityRoutes.post("/communities", async (c) => {
  const auth = c.get("auth");
  const author = auth?.user?.displayName?.trim() || auth?.user?.userId?.trim();
  if (!auth?.authenticated || !author) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" }, requestId: c.get("requestId") }, 401);
  }
  if ((auth.roleLevel ?? 0) < 2) {
    return c.json({ error: { code: "FORBIDDEN", message: "Insufficient permission" }, requestId: c.get("requestId") }, 403);
  }

  const body = await c.req.json().catch(() => null) as Partial<CommunityCreateInput> | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() || null : null;
  if (!title || !url || !label) {
    return c.json({ error: { code: "BAD_REQUEST", message: "title, url and label are required" }, requestId: c.get("requestId") }, 400);
  }

  const community = await createCommunity(getDb(c.env), { title, url, note, label, author });
  if (!community) {
    return c.json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to create community" }, requestId: c.get("requestId") }, 500);
  }
  return c.json(community, 201);
});
