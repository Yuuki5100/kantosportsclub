import { createMiddleware } from "hono/factory";
import { readAccessToken, readCookieValue } from "../service/authCookie";
import { getDb, type AppVariables, type Bindings } from "../env";
import * as AuthService from "../service/authService";
import {
  findEndpointPermission,
  refreshEndpointPermissionCache,
} from "../service/authPermissionService";

const readAccessTokenFromRequest = (cookieHeader: string | undefined): string | null =>
  readAccessToken(cookieHeader) ??
  readCookieValue(cookieHeader, "access_token") ??
  null;

export const authRequired = createMiddleware<{
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

  console.log("[authRequired] endpointPermission", {
    method: c.req.method,
    path,
    endpointPermission,
  });

  if (!endpointPermission) {
    console.log("[authRequired] endpointPermission miss, refreshing cache", {
      method: c.req.method,
      path,
    });
    await refreshEndpointPermissionCache(db);
    endpointPermission = await findEndpointPermission(db, c.req.method, path);
    console.log("[authRequired] endpointPermission after refresh", {
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

  const authorization = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");
  const bearerToken = authorization?.replace(/^Bearer\s+/i, "") ?? "";
  const accessToken = bearerToken || readAccessTokenFromRequest(cookieHeader);

  console.log("[authRequired] request", {
    method: c.req.method,
    path,
    authorizationPresent: Boolean(authorization),
    cookieHeaderPresent: Boolean(cookieHeader),
    hasAccessToken: Boolean(accessToken),
    accessTokenPrefix: accessToken ? accessToken.slice(0, 24) : null,
  });

  if (!accessToken) {
    if (endpointPermission.requiredLevel === 0) {
      c.set("auth", {
        authenticated: false,
        user: null,
        roleLevel: null,
        accessToken: "",
      });

      await next();
      return;
    }

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

  const result = await AuthService.status(db, accessToken);
  console.log("[authRequired] status", {
    method: c.req.method,
    path,
    authenticated: result.authenticated,
    userId: result.user?.userId ?? null,
    roleLevel: result.roleLevel ?? null,
  });

  if (!result.authenticated) {
    if (endpointPermission.requiredLevel === 0) {
      c.set("auth", {
        authenticated: false,
        user: null,
        roleLevel: null,
        accessToken,
      });

      await next();
      return;
    }

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

  c.set("auth", {
    authenticated: true,
    user: result.user ?? null,
    roleLevel: result.roleLevel ?? null,
    accessToken
  });

  await next();
});
