import type { SystemSettingData, SystemSettingUpdateRequest } from "@/types/systemSetting";
import { ensureScenario, mockScenario } from "@/mocks/common/response";
import { mockSystemSettings } from "./data";

export const mockGetSystemSetting = async (): Promise<SystemSettingData> => {
  ensureScenario(mockScenario.systemSettingError, "システム設定の取得に失敗しました");
  return mockSystemSettings;
};

export const mockUpdateSystemSetting = async (
  _request: SystemSettingUpdateRequest
): Promise<SystemSettingData> => {
  return mockSystemSettings;
};

