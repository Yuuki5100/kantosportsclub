import type { AuthClaims, AuthSession, AuthUser, TokenOptions } from "../types/auth";

type AuthGlobal = typeof globalThis & {
  AUTH_SECRET?: string;
  JWT_SECRET?: string;
};

const authGlobal = globalThis as AuthGlobal;

const AUTH_SECRET =
  authGlobal.AUTH_SECRET ??
  authGlobal.JWT_SECRET ??
  "change-me-in-production";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const base64UrlEncode = (input: ArrayBuffer | Uint8Array | string): string => {
  const bytes =
    typeof input === "string"
      ? encoder.encode(input)
      : input instanceof Uint8Array
        ? input
        : new Uint8Array(input);

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

const base64UrlDecode = (input: string): Uint8Array => {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

const getSigningKey = async (): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
};

const sign = async (data: string): Promise<string> => {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(signature);
};

const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diff === 0;
};

export const createAuthUser = (claims: AuthClaims): AuthUser => ({
  userId: claims.sub,
  roleLevel: claims.roleLevel,
  displayName: claims.name,
  email: null,
});

export const createAuthSession = (
  accessToken: string,
  refreshToken: string,
  claims: AuthClaims,
): AuthSession => ({
  accessToken,
  refreshToken,
  user: createAuthUser(claims),
});

export const createAccessToken = async (
  claims: AuthClaims,
  options: TokenOptions,
): Promise<string> => {
  const issuedAt = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload: AuthClaims = {
    ...claims,
    iat: issuedAt,
    exp: issuedAt + options.expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = await sign(unsignedToken);

  return `${unsignedToken}.${signature}`;
};

export const createRefreshToken = (): string => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
};

export const hashToken = async (token: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return base64UrlEncode(digest);
};

export const verifyAccessToken = async (token: string): Promise<AuthClaims | null> => {
  console.log("[authToken] verifyAccessToken start", {
    tokenPrefix: token.slice(0, 24),
    tokenLength: token.length,
  });

  const parts = token.split(".");

  if (parts.length !== 3) {
    console.log("[authToken] verifyAccessToken invalid format", { parts: parts.length });
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = await sign(unsignedToken);

  if (!constantTimeEqual(signature, expectedSignature)) {
    console.log("[authToken] verifyAccessToken signature mismatch", {
      providedSignaturePrefix: signature.slice(0, 12),
      expectedSignaturePrefix: expectedSignature.slice(0, 12),
    });
    return null;
  }

  try {
    const payloadText = decoder.decode(base64UrlDecode(encodedPayload));
    const claims = JSON.parse(payloadText) as AuthClaims;

    console.log("[authToken] verifyAccessToken payload", {
      sub: claims.sub ?? null,
      roleLevel: claims.roleLevel ?? null,
      name: claims.name ?? null,
      exp: claims.exp ?? null,
      now: Math.floor(Date.now() / 1000),
    });

    if (!claims.sub) {
      console.log("[authToken] verifyAccessToken missing sub");
      return null;
    }

    if (claims.exp && claims.exp <= Math.floor(Date.now() / 1000)) {
      console.log("[authToken] verifyAccessToken expired", {
        exp: claims.exp,
        now: Math.floor(Date.now() / 1000),
      });
      return null;
    }

    return claims;
  } catch {
    console.log("[authToken] verifyAccessToken decode failed");
    return null;
  }
};

export const verifyRefreshToken = (_token: string): AuthClaims | null => {
  return null;
};
