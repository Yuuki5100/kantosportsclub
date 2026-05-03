import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { getDb, type AppVariables, type Bindings } from '../env';
import * as AuthService from '../service/authService';
import { setAuthRepositoryDb } from '../repositories/authRepository';
import type { UserPermission } from '../types/auth';

const auth = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

const refreshCookieName = 'refresh_token';
const refreshTokenMaxAge = 60 * 60 * 24 * 30;

type LoginResponseData = {
  authenticated: boolean;
  authType: string;
  givenName: string;
  surname: string;
  email: string;
};

type StatusResponseData = {
  authenticated: boolean;
  userPermissions: UserPermission[];
  rolePermissions: Record<string, number> | null;
  user: {
    givenName: string;
    surname: string;
    email: string;
    userId: string;
  } | null;
};

function isProductionCookie(c: { env: Bindings }) {
  return c.env.COOKIE_SECURE === 'true';
}

const splitDisplayName = (
  displayName: string | null | undefined,
): { givenName: string; surname: string } => {
  const normalized = displayName?.trim() ?? '';
  if (!normalized) {
    return { givenName: '', surname: '' };
  }

  const parts = normalized.split(/\s+/, 2);
  return {
    givenName: parts[0] ?? '',
    surname: parts[1] ?? '',
  };
};

const toLoginResponseData = (user: {
  displayName: string | null;
  email: string | null;
} | null): LoginResponseData => {
  const { givenName, surname } = splitDisplayName(user?.displayName);
  return {
    authenticated: true,
    authType: 'internal',
    givenName,
    surname,
    email: user?.email ?? '',
  };
};

const toStatusResponseData = (result: Awaited<ReturnType<typeof AuthService.status>>): StatusResponseData => {
  const user = result.user
    ? {
        ...splitDisplayName(result.user.displayName),
        email: result.user.email ?? '',
        userId: result.user.userId,
      }
    : null;

  return {
    authenticated: result.authenticated,
    userPermissions: result.permissions ?? [],
    rolePermissions: null,
    user,
  };
};

auth.post('/login', async (c) => {
  setAuthRepositoryDb(getDb(c.env));

  const body = await c.req.json().catch(() => null);

  const username =
    typeof body?.username === 'string'
      ? body.username
      : typeof body?.user_id === 'string'
        ? body.user_id
        : null;
  const password = body?.password;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return c.json(
      { success: false, message: 'username and password are required' },
      400,
    );
  }

  const result = await AuthService.login({
    username,
    userId: username,
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
    data: toLoginResponseData(result.user),
  });
});

auth.post('/refresh', async (c) => {
  setAuthRepositoryDb(getDb(c.env));

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
    data: toLoginResponseData(result.user),
  });
});

auth.post('/logout', async (c) => {
  setAuthRepositoryDb(getDb(c.env));

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
  setAuthRepositoryDb(getDb(c.env));

  const authorization = c.req.header('Authorization');
  const accessToken = authorization?.replace(/^Bearer\s+/i, '');

  const result = await AuthService.status(accessToken);

  return c.json({
    success: true,
    data: toStatusResponseData(result),
  });
});

auth.get('/external-login', async (c) => {
  setAuthRepositoryDb(getDb(c.env));

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
  setAuthRepositoryDb(getDb(c.env));

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
    data: toLoginResponseData(result.user),
  });
});

export default auth;
