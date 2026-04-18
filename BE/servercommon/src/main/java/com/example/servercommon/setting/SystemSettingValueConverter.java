package com.example.servercommon.setting;

import com.example.servercommon.message.BackendMessageCatalog;
import java.time.Duration;
import org.springframework.boot.convert.DurationStyle;
import org.springframework.stereotype.Component;

@Component
public class SystemSettingValueConverter {

    public <T> T convert(String key, String value, Class<T> targetType) {
        if (value == null) {
            return null;
        }

        String conversionErrorMessage = BackendMessageCatalog.format(
                BackendMessageCatalog.EX_SYSTEM_SETTING_CONVERSION_FAILED,
                key,
                value,
                targetType.getSimpleName());

        try {
            if (targetType == String.class) {
                return targetType.cast(value);
            }
            if (targetType == Integer.class) {
                return targetType.cast(Integer.valueOf(value));
            }
            if (targetType == Long.class) {
                return targetType.cast(Long.valueOf(value));
            }
            if (targetType == Boolean.class) {
                if (!"true".equalsIgnoreCase(value) && !"false".equalsIgnoreCase(value)) {
                    throw new IllegalArgumentException(conversionErrorMessage);
                }
                return targetType.cast(Boolean.valueOf(value));
            }
            if (targetType == Duration.class) {
                return targetType.cast(DurationStyle.detectAndParse(value));
            }
        } catch (IllegalArgumentException ex) {
            if (conversionErrorMessage.equals(ex.getMessage())) {
                throw ex;
            }
            throw new IllegalArgumentException(conversionErrorMessage, ex);
        } catch (Exception ex) {
            throw new IllegalArgumentException(conversionErrorMessage, ex);
        }

        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_SYSTEM_SETTING_UNSUPPORTED_TYPE,
                targetType.getSimpleName()));
    }
}
