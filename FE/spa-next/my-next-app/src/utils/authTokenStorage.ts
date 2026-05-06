const ACCESS_TOKEN_KEY = "authAccessToken";
const REFRESH_TOKEN_KEY = "authRefreshToken";

const canUseStorage = (): boolean => typeof window !== "undefined";

export const getStoredAccessToken = (): string | null => {
  if (!canUseStorage()) return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getStoredRefreshToken = (): string | null => {
  if (!canUseStorage()) return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredAuthTokens = (accessToken: string, refreshToken: string): void => {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // ignore storage failures
  }
};

export const clearStoredAuthTokens = (): void => {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore storage failures
  }
};
