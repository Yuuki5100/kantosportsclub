package com.example.servercommon.setting;

import com.example.servercommon.model.SystemSetting;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

final class SystemSettingValueMapper {

    private SystemSettingValueMapper() {
    }

    static Optional<String> resolve(SystemSetting setting, String key) {
        if (setting == null || key == null || key.isBlank()) {
            return Optional.empty();
        }

        String normalized = key.trim().toUpperCase(Locale.ROOT);

        if (SystemSettingKeys.COMPANY_NAME.equals(normalized)) {
            return Optional.ofNullable(setting.getCompanyName());
        }
        if (SystemSettingKeys.PASSWORD_VALID_DAYS.equals(normalized)) {
            return Optional.ofNullable(toStringValue(setting.getPasswordValidityDays()));
        }
        if (SystemSettingKeys.PASSWORD_ATTEMPT_VALIDITY_COUNT.equals(normalized)) {
            return Optional.ofNullable(toStringValue(setting.getPasswordAttemptValidityCount()));
        }
        if (SystemSettingKeys.PASSWORD_REISSUE_URL_EXPIRATION.equals(normalized)) {
            return Optional.ofNullable(toStringValue(setting.getPasswordReissueUrlExpiration()));
        }
        if (SystemSettingKeys.NUMBER_OF_DAYS_AVAILABLE_FOR_RESERVATION.equals(normalized)) {
            return Optional.ofNullable(toStringValue(setting.getNumberOfDaysAvailableForReservation()));
        }
        if (SystemSettingKeys.NUMBER_OF_RETRIES.equals(normalized)) {
            return Optional.ofNullable(toStringValue(resolveNumberOfRetries(setting)));
        }
        if (SystemSettingKeys.NUMBER_OF_NOTICES.equals(normalized)
                || SystemSettingKeys.NOTICE_DISPLAY_LIMIT.toUpperCase(Locale.ROOT).equals(normalized)) {
            return Optional.ofNullable(toStringValue(setting.getNumberOfNotices()));
        }

        return Optional.empty();
    }

    static Map<String, String> toMap(SystemSetting setting) {
        Map<String, String> values = new LinkedHashMap<>();
        if (setting == null) {
            return values;
        }

        values.put(SystemSettingKeys.COMPANY_NAME, setting.getCompanyName());
        values.put(SystemSettingKeys.PASSWORD_VALID_DAYS, toStringValue(setting.getPasswordValidityDays()));
        values.put(SystemSettingKeys.PASSWORD_ATTEMPT_VALIDITY_COUNT,
                toStringValue(setting.getPasswordAttemptValidityCount()));
        values.put(SystemSettingKeys.PASSWORD_REISSUE_URL_EXPIRATION,
                toStringValue(setting.getPasswordReissueUrlExpiration()));
        values.put(SystemSettingKeys.NUMBER_OF_DAYS_AVAILABLE_FOR_RESERVATION,
                toStringValue(setting.getNumberOfDaysAvailableForReservation()));
        values.put(SystemSettingKeys.NUMBER_OF_RETRIES,
                toStringValue(resolveNumberOfRetries(setting)));
        values.put(SystemSettingKeys.NUMBER_OF_NOTICES,
                toStringValue(setting.getNumberOfNotices()));

        return values;
    }

    private static Integer resolveNumberOfRetries(SystemSetting setting) {
        if (setting.getNumberOfRetries() != null) {
            return setting.getNumberOfRetries();
        }
        return setting.getPasswordAttemptValidityCount();
    }

    private static String toStringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
