import type { AuthSession, AuthUser } from "./types";

export type AuthClaims = {
  sub: string;
  roleId: number | null;
  name: string | null;
};

export const createAuthUser = (claims: AuthClaims): AuthUser => ({
  userId: claims.sub,
  roleId: claims.roleId,
  displayName: claims.name
});

export const createAuthSession = (
  accessToken: string,
  refreshToken: string,
  claims: AuthClaims
): AuthSession => ({
  accessToken,
  refreshToken,
  user: createAuthUser(claims)
});

export const verifyAccessToken = (_token: string): AuthClaims | null => {
  return null;
};

export const verifyRefreshToken = (_token: string): AuthClaims | null => {
  return null;
};
