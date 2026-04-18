import type { SystemSettingData } from "@/types/systemSetting";

export const mockSystemSettings: SystemSettingData = {
  systemSettings: [
    { settingName: "パスワード有効日数", settingID: "PASSWORD_VALID_DAYS", value: 90 },
    { settingName: "再発行URL有効時間", settingID: "PASSWORD_REISSUE_URL_EXPIRATION", value: 24 },
    { settingName: "試行回数", settingID: "NUMBER_OF_RETRIES", value: 5 },
    { settingName: "お知らせ表示件数", settingID: "NUMBER_OF_NOTICES", value: 10 },
  ],
};

