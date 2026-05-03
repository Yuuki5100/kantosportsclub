import type { EndpointPermission } from "../types/auth";

export const isAllowedByRequiredLevel = (
  userLevel: number | null | undefined,
  requiredLevel: number
): boolean => {
  if (userLevel == null) {
    return false;
  }
  return userLevel >= requiredLevel;
};

export const checkEndpointPermission = (
  _endpointPermission: EndpointPermission | null,
  _rolePermissions: Record<string, number> | null | undefined
): boolean => {
  return false;
};
