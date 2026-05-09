import { createMiddleware } from "hono/factory";
import { getDb, type AppVariables, type Bindings } from "../env";
import {
  findEndpointPermission,
  checkEndpointPermission,
  refreshEndpointPermissionCache,
} from "../service/authPermissionService";

export const permissionRequired = createMiddleware<{
  Bindings: Bindings;
  Variables: AppVariables;
}>(async (c, next) => {
  const path = c.req.path;

  if (path.startsWith("/api/auth")) {
    await next();
    return;
  }

  const db = getDb(c.env);
  let endpointPermission = await findEndpointPermission(db, c.req.method, path);
  console.log("[permissionRequired] endpointPermission", {
    method: c.req.method,
    path,
    endpointPermission,
  });

  if (!endpointPermission) {
    console.log("[permissionRequired] endpointPermission miss, refreshing cache", {
      method: c.req.method,
      path,
    });
    await refreshEndpointPermissionCache(db);
    endpointPermission = await findEndpointPermission(db, c.req.method, path);
    console.log("[permissionRequired] endpointPermission after refresh", {
      method: c.req.method,
      path,
      endpointPermission,
    });
  }

  if (!endpointPermission) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Permission configuration not found"
        },
        requestId: c.get("requestId")
      },
      403
    );
  }

  if (endpointPermission.requiredLevel === 0) {
    console.log("[permissionRequired] public endpoint allowed", {
      method: c.req.method,
      path,
    });
    await next();
    return;
  }

  const auth = c.get("auth");
  console.log("[permissionRequired] request", {
    method: c.req.method,
    path,
    authenticated: auth?.authenticated ?? false,
    userId: auth?.user?.userId ?? null,
    roleLevel: auth?.roleLevel ?? null,
  });

  if (!auth?.authenticated) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required"
        },
        requestId: c.get("requestId")
      },
      401
    );
  }

  const allowed = checkEndpointPermission(endpointPermission, auth.roleLevel);
  console.log("[permissionRequired] decision", {
    method: c.req.method,
    path,
    allowed,
  });

  if (!allowed) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permission"
        },
        requestId: c.get("requestId")
      },
      403
    );
  }

  await next();
});
