import React, { useEffect, useState } from "react";
import { Box, FlexBox } from "@/components/base/Box";
import FormRow from "@/components/base/Input/FormRow";
import TextBox from "@/components/base/Input/TextBox";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { Font16 } from "@/components/base";
import colors from "@/styles/colors";
import {
  updateSystemSettingApi,
} from "@/api/services/v1/systemSettingService";
import {
  SystemSettingData,
  SystemSettingItem,
  SystemSettingUpdateRequest,
} from "@/types/systemSetting";
import { useSnackbar } from "@/hooks/useSnackbar";
import { usePermission } from "@/hooks/usePermission";
import { getMessage, MessageCodes } from "@/message";
import { useFetch } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/api/apiEndpoints";

type SystemSettings = {
  passwordExpiryDays: number;
  passwordReissueUrlValidHours: number;
  passwordRetryCount: number;
  noticeDisplayCount: number;
};

const SETTING_ID_MAP: Record<string, keyof SystemSettings> = {
  PASSWORD_VALID_DAYS: "passwordExpiryDays",
  PASSWORD_REISSUE_URL_EXPIRATION: "passwordReissueUrlValidHours",
  NUMBER_OF_RETRIES: "passwordRetryCount",
  NUMBER_OF_NOTICES: "noticeDisplayCount",
};

const defaultSettings: SystemSettings = {
  passwordExpiryDays: 0,
  passwordReissueUrlValidHours: 0,
  passwordRetryCount: 0,
  noticeDisplayCount: 0,
};

const mapApiToState = (items: SystemSettingItem[]): SystemSettings => {
  const result = { ...defaultSettings };
  for (const item of items) {
    const key = SETTING_ID_MAP[item.settingID];
    if (key) {
      result[key] = Number(item.value) || 0;
    }
  }
  return result;
};

const SystemSettingsPage: React.FC = () => {
  const { canEditSystemSettings } = usePermission();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isEditMode, setIsEditMode] = useState(false);
  const { showSnackbar } = useSnackbar();
  const {
    data: systemSettingData,
    isError: isSystemSettingError,
    error: systemSettingError,
  } = useFetch<SystemSettingData>("system-setting", API_ENDPOINTS.SYSTEM_SETTING.GET);

  useEffect(() => {
    if (systemSettingData) {
      setSettings(mapApiToState(systemSettingData.systemSettings));
    }
  }, [systemSettingData]);

  useEffect(() => {
    if (isSystemSettingError) {
      console.error("Failed to fetch system settings:", systemSettingError);
      showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "システム設定"), "ERROR");
    }
  }, [isSystemSettingError, systemSettingError, showSnackbar]);

  const handleChange = (field: keyof SystemSettings, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setSettings((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleUpdate = async () => {
    try {
      const request: SystemSettingUpdateRequest = {
        passwordValidDays: settings.passwordExpiryDays,
        passwordReissueUrlExpiration: settings.passwordReissueUrlValidHours,
        numberOfRetries: settings.passwordRetryCount,
        numberOfNotices: settings.noticeDisplayCount,
      };
      const data = await updateSystemSettingApi(request);
      setSettings(mapApiToState(data.systemSettings));
      setIsEditMode(false);
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "設定を更新"), "SUCCESS");
    } catch (error) {
      console.error("Failed to update system settings:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "システム設定の更新"), "ERROR");
    }
  };

  const sectionBoxStyle = {
    border: `1px solid ${colors.commonBorderGray}`,
    borderRadius: 0,
    p: 2,
    mb: 3,
  };

  const sectionTitleStyle = {
    fontWeight: 700,
    fontSize: "16px",

    p: 1,
    mb: 2,
    borderBottom: `1px solid ${colors.commonBorderGray}`,
  };

  const labelRowStyle = {
    "& .MuiTypography-root": {
      color: colors.commonFontColorBlack,
    },
  };

  return (
    <Box sx={{ p: 2, width: "100%" }}>
      <FlexBox justifyContent="flex-end" width="100%" mb={2}>
        {canEditSystemSettings && (isEditMode ? (
          <ButtonAction
            label="登録"
            onClick={handleUpdate}
            sx={{
              backgroundColor: colors.primary,
              color: colors.commonFontColorWhite,
              minWidth: "120px",
              "&:hover": {
                backgroundColor: colors.primary,
              },
            }}
          />
        ) : (
          <ButtonAction
            label="更新"
            onClick={handleEdit}
            sx={{
              backgroundColor: colors.primary,
              color: colors.commonFontColorWhite,
              minWidth: "120px",
              "&:hover": {
                backgroundColor: colors.primary,
              },
            }}
          />
        ))}
      </FlexBox>

      <Box sx={sectionBoxStyle} width={"100%"}>
        <Font16 sx={sectionTitleStyle}>パスワード設定</Font16>

        <FormRow
          label="パスワード期限日数"
          required={true}
          labelAlignment="center"
          labelMinWidth="250px"
          rowCustomStyle={labelRowStyle}
        >
          <FlexBox alignItems="center" gap={1} width="100%">
            <TextBox
              name="passwordExpiryDays"
              value={String(settings.passwordExpiryDays)}
              onChange={(e) => handleChange("passwordExpiryDays", e.target.value)}
              disabled={!isEditMode}
              customStyle={{ width: "100%" }}
            />
            <Font16 bold={false} sx={{ minWidth: "30px" }}>日</Font16>
          </FlexBox>
        </FormRow>

        <FormRow
          label="パスワード再発行URL有効期限時間"
          required={true}
          labelAlignment="center"
          labelMinWidth="250px"
          rowCustomStyle={labelRowStyle}
        >
          <FlexBox alignItems="center" gap={1} width="100%">
            <TextBox
              name="passwordReissueUrlValidHours"
              value={String(settings.passwordReissueUrlValidHours)}
              onChange={(e) => handleChange("passwordReissueUrlValidHours", e.target.value)}
              disabled={!isEditMode}
              customStyle={{ width: "100%" }}
            />
            <Font16 bold={false} sx={{ minWidth: "40px" }}>時間</Font16>
          </FlexBox>
        </FormRow>

        <FormRow
          label="パスワード試行有効回数"
          required={true}
          labelAlignment="center"
          labelMinWidth="250px"
          rowCustomStyle={labelRowStyle}
        >
          <FlexBox alignItems="center" gap={1} width="100%">
            <TextBox
              name="passwordRetryCount"
              value={String(settings.passwordRetryCount)}
              onChange={(e) => handleChange("passwordRetryCount", e.target.value)}
              disabled={!isEditMode}
              customStyle={{ width: "100%" }}
            />
            <Font16 bold={false} sx={{ minWidth: "30px" }}>回</Font16>
          </FlexBox>
        </FormRow>
      </Box>

      <Box sx={sectionBoxStyle} width={"100%"}>
        <Font16 sx={sectionTitleStyle}>TOP画面設定</Font16>

        <FormRow
          label="お知らせ表示件数"
          labelAlignment="center"
          labelMinWidth="250px"
          rowCustomStyle={labelRowStyle}
        >
          <FlexBox alignItems="center" gap={1} width="100%">
            <TextBox
              name="noticeDisplayCount"
              value={String(settings.noticeDisplayCount)}
              onChange={(e) => handleChange("noticeDisplayCount", e.target.value)}
              disabled={!isEditMode}
              customStyle={{ width: "100%" }}
            />
            <Font16 bold={false} sx={{ minWidth: "30px" }}>件</Font16>
          </FlexBox>
        </FormRow>
      </Box>
    </Box>
  );
};

export default SystemSettingsPage;
