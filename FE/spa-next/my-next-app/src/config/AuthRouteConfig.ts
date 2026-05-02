export const publicPathPrefixes = [
  "/login",
  "/callback",
  "/403",
  "/404",
  "/_error",
  "/forgot-password",
  "/reset-password",
] as const;

export const authCheckExcludedPaths = [
  "/top-page",
  "admin/basketball-overview",
  "/boardgames",
  "/movies",
  "/pictures",
] as const;

const normalizePath = (path: string): string => {
  const pathWithoutQuery = path.split(/[?#]/)[0] ?? "";
  if (pathWithoutQuery.length > 1 && pathWithoutQuery.endsWith("/")) {
    return pathWithoutQuery.slice(0, -1);
  }
  return pathWithoutQuery || "/";
};

const matchesPathPrefix = (path: string, prefix: string): boolean => {
  const normalizedPath = normalizePath(path);
  const normalizedPrefix = normalizePath(prefix);

  return normalizedPath === normalizedPrefix || normalizedPath.startsWith(`${normalizedPrefix}/`);
};

export const isPublicPath = (path: string): boolean =>
  publicPathPrefixes.some((publicPath) => matchesPathPrefix(path, publicPath));

export const shouldSkipAuthCheck = (path: string): boolean => {
  const normalizedPath = normalizePath(path);
  return authCheckExcludedPaths.some((excludedPath) => normalizedPath === normalizePath(excludedPath));
};
