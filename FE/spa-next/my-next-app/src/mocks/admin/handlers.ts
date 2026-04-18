import type { UpdateUserPermissionsRequest } from "@/types/admin";
import { mockAdminUsers } from "./data";

export const mockGetAdminUsers = async () => {
  const list = [...mockAdminUsers];
  (list as unknown as { data?: typeof list }).data = list;
  (list as unknown as { success?: boolean }).success = true;
  return list;
};

export const mockDeleteAdminUser = async (_userId: string): Promise<void> => {
  return;
};

export const mockUpdateUserPermissions = async (
  _request: UpdateUserPermissionsRequest
): Promise<null> => {
  return null;
};
