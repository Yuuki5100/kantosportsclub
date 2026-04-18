import type { ApiResponse } from "@/types/api";

export const mockScenario = {
  authError: false,
  userListError: false,
  roleListError: false,
  noticeListError: false,
  manualListError: false,
  systemSettingError: false,
  permissionDenied: false,
};

export const mockDelay = async (ms: number = 200): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const ok = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  error: null,
});

export const fail = (message: string): ApiResponse<null> => ({
  success: false,
  data: null as unknown as null,
  error: message,
});

export const ensureScenario = (flag: boolean, message: string): void => {
  if (flag) {
    throw new Error(message);
  }
};

