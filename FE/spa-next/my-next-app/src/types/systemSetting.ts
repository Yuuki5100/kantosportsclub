// src/types/systemSetting.ts

/** システム設定の個別項目 */
export interface SystemSettingItem {
  settingName: string;
  settingID: string;
  value: number;
}

/** GET /api/system → data.data (SystemSettingData) */
export interface SystemSettingData {
  systemSettings: SystemSettingItem[];
}

/**
 * SystemSettingResponse wrapper returned by the controller.
 * Sits inside ApiResponse.data.
 */
export interface SystemSettingResponse<T> {
  result: string;
  message: number;
  args: string;
  data: T;
}

/** PUT /api/system request body */
export interface SystemSettingUpdateRequest {
  passwordValidDays: number;
  passwordReissueUrlExpiration: number;
  numberOfRetries: number;
  numberOfNotices: number;
}
