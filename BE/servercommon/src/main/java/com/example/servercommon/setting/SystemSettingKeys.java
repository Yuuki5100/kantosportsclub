package com.example.servercommon.setting;

public final class SystemSettingKeys {

    private SystemSettingKeys() {
    }

    public static final String COMPANY_NAME = "COMPANY_NAME";
    public static final String PASSWORD_VALID_DAYS = "PASSWORD_VALID_DAYS";
    public static final String PASSWORD_ATTEMPT_VALIDITY_COUNT = "PASSWORD_ATTEMPT_VALIDITY_COUNT";
    public static final String PASSWORD_REISSUE_URL_EXPIRATION = "PASSWORD_REISSUE_URL_EXPIRATION";
    public static final String NUMBER_OF_DAYS_AVAILABLE_FOR_RESERVATION = "NUMBER_OF_DAYS_AVAILABLE_FOR_RESERVATION";
    public static final String NUMBER_OF_RETRIES = "NUMBER_OF_RETRIES";
    public static final String NUMBER_OF_NOTICES = "NUMBER_OF_NOTICES";

    // 旧実装互換キー
    public static final String NOTICE_DISPLAY_LIMIT = "noticeDisplayLimit";
}
