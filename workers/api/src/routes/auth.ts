import { Hono } from 'hono';
import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { AuthService } from './authService';

type Env = {
  Bindings: {
    DB: D1Database;
    AUTH_TYPE?: string;
    JWT_SECRET: string;
    COOKIE_SECURE?: string;
  };
};

const auth = new Hono<Env>();

const refreshCookieName = 'refresh_token';

function getAuthService(c: Context<Env>) {
  return new AuthService({
    db: c.env.DB,
    authType: c.env.AUTH_TYPE ?? 'password',
    jwtSecret: c.env.JWT_SECRET,
  });
}

function isProductionCookie(c: Context<Env>) {
  return c.env.COOKIE_SECURE === 'true';
}

/**
 * POST /api/auth/login
 */
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null);

  const username = body?.username;
  const password = body?.password;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return c.json(
      {
        success: false,
        message: 'username and password are required',
      },
      400,
    );
  }

  const service = getAuthService(c);

  const result = await service.login({
    username,
    password,
    userAgent: c.req.header('User-Agent') ?? null,
    ipAddress: c.req.header('CF-Connecting-IP') ?? null,
  });

  setCookie(c, refreshCookieName, result.refreshToken, {
    httpOnly: true,
    secure: isProductionCookie(c),
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: result.refreshTokenExpiresIn,
  });

  return c.json({
    success: true,
    accessToken: result.accessToken,
    user: result.user,
    permissions: result.permissions,
  });
});

/**
 * POST /api/auth/refresh
 */
auth.post('/refresh', async (c) => {
  const refreshToken =
    getCookie(c, refreshCookieName) ??
    c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!refreshToken) {
    return c.json(
      {
        success: false,
        message: 'refresh token is required',
      },
      401,
    );
  }

  const service = getAuthService(c);
  const result = await service.refresh(refreshToken);

  return c.json({
    success: true,
    accessToken: result.accessToken,
    user: result.user,
    permissions: result.permissions,
  });
});

/**
 * POST /api/auth/logout
 */
auth.post('/logout', async (c) => {
  const refreshToken = getCookie(c, refreshCookieName);

  if (refreshToken) {
    const service = getAuthService(c);
    await service.logout(refreshToken);
  }

  deleteCookie(c, refreshCookieName, {
    path: '/api/auth',
  });

  return c.json({
    success: true,
  });
});

/**
 * GET /api/auth/status
 */
auth.get('/status', async (c) => {
  const authorization = c.req.header('Authorization');
  const accessToken = authorization?.replace(/^Bearer\s+/i, '');

  if (!accessToken) {
    return c.json({
      authenticated: false,
      user: null,
      permissions: [],
    });
  }

  const service = getAuthService(c);
  const result = await service.status(accessToken);

  return c.json({
    authenticated: result.authenticated,
    user: result.user,
    permissions: result.permissions,
  });
});

/**
 * GET /api/auth/external-login
 */
auth.get('/external-login', async (c) => {
  const service = getAuthService(c);
  const result = await service.externalLogin();

  return c.json(result);
});

/**
 * GET /api/auth/callback
 */
auth.get('/callback', async (c) => {
  const service = getAuthService(c);

  const result = await service.callback({
    code: c.req.query('code') ?? null,
    state: c.req.query('state') ?? null,
  });

  if (result.refreshToken) {
    setCookie(c, refreshCookieName, result.refreshToken, {
      httpOnly: true,
      secure: isProductionCookie(c),
      sameSite: 'Lax',
      path: '/api/auth',
      maxAge: result.refreshTokenExpiresIn,
    });
  }

  return c.json({
    success: true,
    accessToken: result.accessToken,
    user: result.user,
    permissions: result.permissions,
  });
});

export default auth;