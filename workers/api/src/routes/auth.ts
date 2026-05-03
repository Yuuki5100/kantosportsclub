// routes/auth.ts
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import * as AuthService from '../service/authService';

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
const refreshTokenMaxAge = 60 * 60 * 24 * 30;

function isProductionCookie(c: { env: Env['Bindings'] }) {
  return c.env.COOKIE_SECURE === 'true';
}

auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null);

  const username = body?.username;
  const password = body?.password;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return c.json(
      { success: false, message: 'username and password are required' },
      400,
    );
  }

  const result = await AuthService.login({
    username,
    password,
    userAgent: c.req.header('User-Agent') ?? null,
    ipAddress: c.req.header('CF-Connecting-IP') ?? null,
  });

  if (!result) {
    return c.json(
      { success: false, message: 'login failed' },
      401,
    );
  }

  setCookie(c, refreshCookieName, result.refreshToken, {
    httpOnly: true,
    secure: isProductionCookie(c),
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: refreshTokenMaxAge,
  });

  return c.json({
    success: true,
    accessToken: result.accessToken,
    user: result.user,
  });
});

auth.post('/refresh', async (c) => {
  const refreshToken =
    getCookie(c, refreshCookieName) ??
    c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!refreshToken) {
    return c.json(
      { success: false, message: 'refresh token is required' },
      401,
    );
  }

  const result = await AuthService.refresh(refreshToken);

  if (!result) {
    return c.json(
      { success: false, message: 'refresh failed' },
      401,
    );
  }

  setCookie(c, refreshCookieName, result.refreshToken, {
    httpOnly: true,
    secure: isProductionCookie(c),
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: refreshTokenMaxAge,
  });

  return c.json({
    success: true,
    accessToken: result.accessToken,
    user: result.user,
  });
});

auth.post('/logout', async (c) => {
  const refreshToken = getCookie(c, refreshCookieName);

  if (refreshToken) {
    await AuthService.logout(refreshToken);
  }

  deleteCookie(c, refreshCookieName, {
    path: '/api/auth',
  });

  return c.json({ success: true });
});

auth.get('/status', async (c) => {
  const authorization = c.req.header('Authorization');
  const accessToken = authorization?.replace(/^Bearer\s+/i, '');

  const result = await AuthService.status(accessToken);

  return c.json(result);
});

auth.get('/external-login', async (c) => {
  try {
    const result = await AuthService.externalLogin();
    return c.json(result);
  } catch {
    return c.json(
      { success: false, message: 'external login is not implemented' },
      501,
    );
  }
});

auth.get('/callback', async (c) => {
  const code = c.req.query('code') ?? '';
  const state = c.req.query('state') ?? '';

  const result = await AuthService.callback(code, state);

  if (!result) {
    return c.json(
      { success: false, message: 'callback failed' },
      401,
    );
  }

  setCookie(c, refreshCookieName, result.refreshToken, {
    httpOnly: true,
    secure: isProductionCookie(c),
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: refreshTokenMaxAge,
  });

  return c.json({
    success: true,
    accessToken: result.accessToken,
    user: result.user,
  });
});

export default auth;