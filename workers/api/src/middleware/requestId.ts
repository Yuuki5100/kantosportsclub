import { createMiddleware } from "hono/factory";
import type { AppVariables, Bindings } from "../env";

export const requestId = createMiddleware<{
  Bindings: Bindings;
  Variables: AppVariables;
}>(async (c, next) => {
  const existing = c.req.header("x-request-id");
  c.set("requestId", existing ?? crypto.randomUUID());
  await next();
  c.header("x-request-id", c.get("requestId"));
});
