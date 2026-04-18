import type {
  SystemSettingData,
  SystemSettingUpdateRequest,
} from "@/types/systemSetting";
import { mockGetSystemSetting, mockUpdateSystemSetting } from "@/mocks/systemSetting/handlers";

export const getSystemSettingApi = async (): Promise<SystemSettingData> => {
  return mockGetSystemSetting();
};

export const updateSystemSettingApi = async (
  data: SystemSettingUpdateRequest
): Promise<SystemSettingData> => {
  return mockUpdateSystemSetting(data);
};

export const reloadSystemSettingCacheApi = async (): Promise<void> => {
  return;
};
