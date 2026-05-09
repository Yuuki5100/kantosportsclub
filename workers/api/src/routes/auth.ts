import { Hono } from 'hono';
import { getDb, type AppVariables, type Bindings } from '../env';
import * as AuthService from '../service/authService';
import { readAccessToken, readCookieValue } from '../service/authCookie';

const auth = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

type LoginResponseData = {
  authenticated: boolean;
  authType: string;
  givenName: string;
  surname: string;
  email: string;
  accessToken: string;
  refreshToken: string;
};

type StatusResponseData = {
  authenticated: boolean;
  roleLevel: number | null;
  user: {
    givenName: string;
    surname: string;
    email: string;
    userId: string;
  } | null;
};

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
}, session: { accessToken: string; refreshToken: string } | null): LoginResponseData => {
  const { givenName, surname } = splitDisplayName(user?.displayName);
  return {
    authenticated: true,
    authType: 'internal',
    givenName,
    surname,
    email: user?.email ?? '',
    accessToken: session?.accessToken ?? '',
    refreshToken: session?.refreshToken ?? '',
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
    roleLevel: result.roleLevel ?? null,
    user,
  };
};

auth.post('/login', async (c) => {
  try {
    const db = getDb(c.env);

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

    const result = await AuthService.login(db, {
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

    return c.json({
      success: true,
      data: toLoginResponseData(result.user, result),
    });
  } catch (error) {
    console.error("[auth] login failed", error);
    throw error;
  }
});

auth.post('/refresh', async (c) => {
  try {
    const db = getDb(c.env);

    const body = await c.req.json().catch(() => null);
    const refreshToken =
      (typeof body?.refreshToken === 'string' ? body.refreshToken : null) ??
      c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');

    if (!refreshToken) {
      return c.json(
        { success: false, message: 'refresh token is required' },
        401,
      );
    }

    const result = await AuthService.refresh(db, refreshToken);

    if (!result) {
      return c.json(
        { success: false, message: 'refresh failed' },
        401,
      );
    }

    return c.json({
      success: true,
      data: toLoginResponseData(result.user, result),
    });
  } catch (error) {
    console.error("[auth] refresh failed", error);
    throw error;
  }
});

auth.post('/logout', async (c) => {
  try {
    const db = getDb(c.env);

    const body = await c.req.json().catch(() => null);
    const refreshToken =
      (typeof body?.refreshToken === 'string' ? body.refreshToken : null) ??
      c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');

    if (refreshToken) {
      await AuthService.logout(db, refreshToken);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("[auth] logout failed", error);
    throw error;
  }
});

auth.get('/status', async (c) => {
  try {
    const db = getDb(c.env);

    const authorization = c.req.header('Authorization');
    const accessToken =
      authorization?.replace(/^Bearer\s+/i, '') ||
      readAccessToken(c.req.header('Cookie')) ||
      readCookieValue(c.req.header('Cookie'), 'access_token') ||
      '';

    const result = await AuthService.status(db, accessToken);

    return c.json({
      success: true,
      data: toStatusResponseData(result),
    });
  } catch (error) {
    console.error("[auth] status failed", error);
    throw error;
  }
});

auth.get('/external-login', async (c) => {
  try {
    getDb(c.env);
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
  try {
    const db = getDb(c.env);

    const code = c.req.query('code') ?? '';
    const state = c.req.query('state') ?? '';

    const result = await AuthService.callback(code, state);

    if (!result) {
      return c.json(
        { success: false, message: 'callback failed' },
        401,
      );
    }

    return c.json({
      success: true,
      data: toLoginResponseData(result.user, result),
    });
  } catch (error) {
    console.error("[auth] callback failed", error);
    throw error;
  }
});

export default auth;
