import type { UserPermission } from "../types/auth";

export type EndpointPermissionConfig = {
  method: string;
  path: string;
  menuFunctionIds: string[];
  custom: Record<string, number>;
  defaultLevel: number;
  requiredLevel: number;
};

type EndpointAuthorityMappingRow = {
  method: string;
  url: string;
  menuFunctionId: number;
  requiredLevel: number;
};

type CachedPermissionConfig = {
  expiresAt: number;
  entries: EndpointPermissionConfig[];
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

const specificityScore = (pattern: string): number => {
  const segments = pattern.split("/").filter(Boolean);
  const wildcardPenalty = segments.reduce((score, segment) => {
    if (segment === "**") return score - 4;
    if (segment.includes("*")) return score - 2;
    return score + 1;
  }, 0);
  return segments.length * 10 + wildcardPenalty;
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

const getCacheTtlMs = (dbTtlSeconds: string | undefined): number => {
  const parsed = Number(dbTtlSeconds ?? DEFAULT_CACHE_TTL_SECONDS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed * 1000 : DEFAULT_CACHE_TTL_SECONDS * 1000;
};

const buildEndpointPermissionConfig = (
  rows: EndpointAuthorityMappingRow[],
): EndpointPermissionConfig => {
  const first = rows[0];
  const custom = rows.reduce<Record<string, number>>((acc, row) => {
    const key = String(row.menuFunctionId);
    acc[key] = Math.max(acc[key] ?? 0, row.requiredLevel);
    return acc;
  }, {});

  const requiredLevel = rows.reduce(
    (max, row) => Math.max(max, row.requiredLevel),
    0
  );

  return {
    method: normalizeMethod(first.method),
    path: normalizePath(first.url),
    menuFunctionIds: [...new Set(rows.map((row) => String(row.menuFunctionId)))],
    custom,
    defaultLevel: requiredLevel,
    requiredLevel,
  };
};

const loadEndpointPermissions = async (db: D1Database): Promise<EndpointPermissionConfig[]> => {
  const result = await db
    .prepare(
      `
      SELECT
        method,
        url,
        menu_function_id AS menuFunctionId,
        required_level AS requiredLevel
      FROM endpoint_authority_mapping
      WHERE method IS NOT NULL
        AND url IS NOT NULL
      ORDER BY method ASC, url ASC, menu_function_id ASC
      `,
    )
    .all<EndpointAuthorityMappingRow>();

  const grouped = new Map<string, EndpointAuthorityMappingRow[]>();
  for (const row of result.results ?? []) {
    const key = `${normalizeMethod(row.method)} ${normalizePath(row.url)}`;
    const existing = grouped.get(key) ?? [];
    existing.push({
      method: normalizeMethod(row.method),
      url: normalizePath(row.url),
      menuFunctionId: Number(row.menuFunctionId),
      requiredLevel: Number(row.requiredLevel),
    });
    grouped.set(key, existing);
  }

  return [...grouped.values()].map(buildEndpointPermissionConfig).sort(
    (a, b) => specificityScore(b.path) - specificityScore(a.path)
  );
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

export const isAllowedByRequiredLevel = (
  userLevel: number | null | undefined,
  requiredLevel: number
): boolean => {
  if (userLevel == null) {
    return false;
  }
  return userLevel >= requiredLevel;
};

export const refreshEndpointPermissionCache = async (
  db: D1Database,
  ttlSeconds?: number,
): Promise<void> => {
  const ttlMs = (ttlSeconds ?? DEFAULT_CACHE_TTL_SECONDS) * 1000;
  cachedPermissions = {
    entries: await loadEndpointPermissions(db),
    expiresAt: Date.now() + ttlMs,
  };
};

export const findEndpointPermission = async (
  db: D1Database,
  method: string,
  path: string,
): Promise<EndpointPermissionConfig | null> => {
  const ttlMs = getCacheTtlMs(undefined);
  await ensurePermissionCache(db, ttlMs);

  const requestMethod = normalizeMethod(method);
  const requestPath = normalizePath(path);
  const entries = cachedPermissions?.entries ?? [];

  return (
    entries.find((entry) => {
      if (entry.method !== requestMethod) {
        return false;
      }
      const pattern = patternToRegExp(entry.path);
      return pattern.test(requestPath);
    }) ?? null
  );
};

export const buildRolePermissionsMap = (
  permissions: UserPermission[] | null | undefined,
): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const permission of permissions ?? []) {
    const keyCandidates = [
      permission.permissionName,
      permission.permissionId,
      permission.menuFunctionId,
    ]
      .map((value) => (value == null ? null : String(value)))
      .filter((value): value is string => Boolean(value));

    for (const key of keyCandidates) {
      const nextValue = permission.statusLevelId;
      result[key] = Math.max(result[key] ?? 0, nextValue);
    }
  }
  return result;
};

export const checkEndpointPermission = (
  endpointPermission: EndpointPermissionConfig | null,
  rolePermissions: Record<string, number> | null | undefined
): boolean => {
  if (!endpointPermission || !rolePermissions) {
    console.log("[authPermissionService] checkEndpointPermission skipped", {
      hasEndpointPermission: Boolean(endpointPermission),
      hasRolePermissions: Boolean(rolePermissions),
    });
    return false;
  }

  const menuFunctionIds = endpointPermission.menuFunctionIds.length > 0
    ? endpointPermission.menuFunctionIds
    : Object.keys(endpointPermission.custom);

  if (menuFunctionIds.length === 0) {
    console.log("[authPermissionService] checkEndpointPermission no menuFunctionIds", {
      endpointPermission,
    });
    return false;
  }

  const result = menuFunctionIds.some((menuFunctionId) => {
    const requiredLevel = endpointPermission.custom[menuFunctionId] ?? endpointPermission.requiredLevel;
    const userLevel = rolePermissions[menuFunctionId];
    console.log("[authPermissionService] compare", {
      menuFunctionId,
      userLevel,
      requiredLevel,
      allowed: isAllowedByRequiredLevel(userLevel, requiredLevel),
      endpointPath: endpointPermission.path,
      endpointMethod: endpointPermission.method,
    });
    return isAllowedByRequiredLevel(userLevel, requiredLevel);
  });

  console.log("[authPermissionService] checkEndpointPermission result", {
    endpointPath: endpointPermission.path,
    endpointMethod: endpointPermission.method,
    result,
  });

  return result;
};
