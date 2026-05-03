import type { AuthStatusResponse, EndpointPermission } from "../auth/types";

export const findAuthStatus = async (): Promise<AuthStatusResponse | null> => {
  return null;
};

export const findRefreshToken = async (_token: string): Promise<{ userId: string } | null> => {
  return null;
};

export const saveRefreshToken = async (): Promise<void> => {
  return;
};

export const revokeRefreshToken = async (): Promise<void> => {
  return;
};

export const findEndpointPermission = async (
  _method: string,
  _path: string
): Promise<EndpointPermission | null> => {
  return null;
};

export const findRolePermissions = async (
  _roleId: number
): Promise<Record<string, number>> => {
  return {};
};
