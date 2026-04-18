package com.example.servercommon.validation.util;

import com.example.servercommon.validation.ValidationResult;
import org.apache.commons.csv.CSVRecord;

import java.util.Optional;

public class ValidationUtils {

    /**
     * 空文字チェック（必須項目）
     */
    public static void requireNotBlank(CSVRecord record, String fieldName, ValidationResult<?> result, String errorMessage) {
        String value = record.get(fieldName);
        if (value == null || value.trim().isEmpty()) {
            result.addError(errorMessage);
        }
    }

    /**
     * メール形式の簡易チェック
     */
    public static void validateEmail(String email, ValidationResult<?> result, String errorMessage) {
        if (email == null || !email.contains("@")) {
            result.addError(errorMessage);
        }
    }

    /**
     * Enum変換の安全ラッパー（変換失敗でエラー追加）
     */
    public static <E extends Enum<E>> Optional<E> safeParseEnum(
            String value, Class<E> enumClass, ValidationResult<?> result, String errorMessage) {
        try {
            if (value != null && !value.trim().isEmpty()) {
                return Optional.of(Enum.valueOf(enumClass, value.trim()));
            }
        } catch (IllegalArgumentException e) {
            // 下で result.addError 実行
        }
        result.addError(errorMessage);
        return Optional.empty();
    }
}
