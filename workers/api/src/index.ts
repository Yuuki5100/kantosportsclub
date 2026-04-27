import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppVariables, Bindings } from "./env";
import { requestId } from "./middleware/requestId";
import { healthRoutes } from "./routes/health";

const app = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

app.use("*", requestId);
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowedOrigin = c.env.CORS_ORIGIN ?? "http://localhost:3000";
      return origin === allowedOrigin ? origin : allowedOrigin;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "traceparent"],
    credentials: true
  })
);

app.get("/", (c) => c.redirect("/api/health"));
app.route("/api/health", healthRoutes);

app.notFound((c) =>
  c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: "Route not found"
      },
      requestId: c.get("requestId")
    },
    404
  )
);

app.onError((error, c) => {
  console.error(error);
  return c.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected server error"
      },
      requestId: c.get("requestId")
    },
    500
  );
});

export default app;
