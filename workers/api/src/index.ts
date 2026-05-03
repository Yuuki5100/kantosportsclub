import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppVariables, Bindings } from "./env";
import { requestId } from "./middleware/requestId";
import { authRequired } from "./middleware/authRequired";
import { permissionRequired } from "./middleware/permissionRequired";
import { healthRoutes } from "./routes/health";
import { boardgameRoutes } from "./routes/boardgame";
import { noticeRoutes } from "./routes/notice";
import { masterLocationRoutes } from "./routes/masterLocation";
import { mediaRoutes } from "./routes/media";
import auth from "./routes/auth";

const app = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

console.log('WORKER BOOTED');

// app.use('*', async (c, next) => {
//   console.log('REQUEST:', c.req.method, c.req.path);
//   await next();
// });

app.use("*", requestId);
app.use("*", async (c, next) => {
  console.log("[index] request", {
    method: c.req.method,
    path: c.req.path,
  });
  await next();
});
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
// app.use("/api/*", authRequired);
// app.use("/api/*", permissionRequired);

app.get("/", (c) => c.redirect("/api/health"));
app.route("/api/health", healthRoutes);
app.route("/api", boardgameRoutes);
app.route("/api", noticeRoutes);
app.route("/api", mediaRoutes);
app.route("/api", masterLocationRoutes);
app.route('/api/auth', auth);

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
