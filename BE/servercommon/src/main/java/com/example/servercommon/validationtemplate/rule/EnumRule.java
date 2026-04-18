package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;

import java.util.List;

// EnumRule.java
public class EnumRule implements ValidationRule {
    private final ErrorCodeService errorCodeService;

    public EnumRule() {
        this(null);
    }

    public EnumRule(ErrorCodeService errorCodeService) {
        this.errorCodeService = errorCodeService;
    }

    @Override
    public void validate(String fieldName, String value, ColumnSchema schema, ValidationResult result) {
        if (schema.getEnumValues() != null && value != null) {
            String trimmedValue = value.trim();
            boolean match = schema.getEnumValues().stream()
                .anyMatch(enumVal -> enumVal.equalsIgnoreCase(trimmedValue));
            if (!match) {
                String message = errorCodeService != null
                        ? errorCodeService.getErrorMessage("EA001", List.of(value), "ja")
                        : "許可されていない値です: " + value;
                result.addError(fieldName, message);
            }
        }
    }
}
