const ACCESS_TOKEN_COOKIE = "ACCESS_TOKEN";
const REFRESH_TOKEN_COOKIE = "REFRESH_TOKEN";

const buildCookie = (name: string, value: string, maxAgeSeconds: number): string =>
  `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;

export const buildAccessTokenCookie = (value: string, maxAgeSeconds: number): string =>
  buildCookie(ACCESS_TOKEN_COOKIE, value, maxAgeSeconds);

export const buildRefreshTokenCookie = (value: string, maxAgeSeconds: number): string =>
  buildCookie(REFRESH_TOKEN_COOKIE, value, maxAgeSeconds);

export const clearAuthCookies = (): string[] => [
  `${ACCESS_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  `${REFRESH_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
];

export const readCookieValue = (cookieHeader: string | undefined, name: string): string | null => {
  if (!cookieHeader) {
    return null;
  }

  const entries = cookieHeader.split(";").map((part) => part.trim());
  const match = entries.find((entry) => entry.startsWith(`${name}=`));
  if (!match) {
    return null;
  }

  const encoded = match.slice(name.length + 1);
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
};

export const readAccessToken = (cookieHeader: string | undefined): string | null =>
  readCookieValue(cookieHeader, ACCESS_TOKEN_COOKIE);

export const readRefreshToken = (cookieHeader: string | undefined): string | null =>
  readCookieValue(cookieHeader, REFRESH_TOKEN_COOKIE);
