type EndpointAuthorityMappingRow = {
  method: string;
  url: string;
  requiredLevel: number;
};

type CachedPermissionConfig = {
  expiresAt: number;
  entries: EndpointAuthorityMappingRow[];
};

const DEFAULT_CACHE_TTL_SECONDS = 600;

let cachedPermissions: CachedPermissionConfig | null = null;
let refreshPromise: Promise<void> | null = null;

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const patternToRegExp = (pattern: string): RegExp => {
  const normalized = pattern.replace(/\/+$/, "") || "/";
  const escaped = escapeRegex(normalized)
    .replaceAll("\\*\\*", ".*")
    .replaceAll("\\*", "[^/]+");
  return new RegExp(`^${escaped}$`);
};

const normalizePath = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "/";
  }
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.replace(/\/+$/, "") || "/";
};

const normalizeMethod = (value: string): string => value.trim().toUpperCase();

const getCacheTtlMs = (): number => DEFAULT_CACHE_TTL_SECONDS * 1000;

const loadEndpointPermissions = async (db: D1Database): Promise<EndpointAuthorityMappingRow[]> => {
  const result = await db
    .prepare(
      `
      SELECT
        method,
        url,
        required_level AS requiredLevel
      FROM endpoint_authority_mapping
      WHERE method IS NOT NULL
        AND url IS NOT NULL
      ORDER BY method ASC, url ASC, required_level ASC
      `,
    )
    .all<EndpointAuthorityMappingRow>();

  return (result.results ?? []).map((row) => ({
    method: normalizeMethod(row.method),
    url: normalizePath(row.url),
    requiredLevel: Number(row.requiredLevel),
  }));
};

const ensurePermissionCache = async (db: D1Database, ttlMs: number): Promise<void> => {
  const now = Date.now();
  if (cachedPermissions && cachedPermissions.expiresAt > now) {
    return;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const entries = await loadEndpointPermissions(db);
      cachedPermissions = {
        entries,
        expiresAt: Date.now() + ttlMs,
      };
    })().finally(() => {
      refreshPromise = null;
    });
  }

  await refreshPromise;
};

export const refreshEndpointPermissionCache = async (db: D1Database): Promise<void> => {
  cachedPermissions = {
    entries: await loadEndpointPermissions(db),
    expiresAt: Date.now() + getCacheTtlMs(),
  };
};

export const findEndpointPermission = async (
  db: D1Database,
  method: string,
  path: string,
): Promise<{ method: string; path: string; requiredLevel: number } | null> => {
  await ensurePermissionCache(db, getCacheTtlMs());

  const requestMethod = normalizeMethod(method);
  const requestPath = normalizePath(path);
  const entries = cachedPermissions?.entries ?? [];

  const match = entries.find((entry) => {
    if (entry.method !== requestMethod) {
      return false;
    }
    return patternToRegExp(entry.url).test(requestPath);
  });

  if (!match) {
    return null;
  }

  return {
    method: match.method,
    path: match.url,
    requiredLevel: match.requiredLevel,
  };
};

export const checkEndpointPermission = (
  endpointPermission: { requiredLevel: number } | null,
  userLevel: number | null | undefined,
): boolean => {
  if (!endpointPermission) {
    return false;
  }

  if (endpointPermission.requiredLevel === 0) {
    return true;
  }

  if (userLevel == null) {
    return false;
  }

  return userLevel >= endpointPermission.requiredLevel;
};
