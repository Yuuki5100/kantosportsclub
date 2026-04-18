package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;

import java.util.List;
import java.util.regex.Pattern;

public class PatternRule implements ValidationRule {

    private final ErrorCodeService errorCodeService;
    private static final String DEFAULT_LOCALE = "ja";

    public PatternRule(ErrorCodeService errorCodeService) {
        this.errorCodeService = errorCodeService;
    }

    @Override
    public void validate(String fieldName, String value, ColumnSchema schema, ValidationResult result) {
        if (schema.getPattern() != null && value != null && !value.isEmpty()) {
            if (!Pattern.matches(schema.getPattern(), value)) {
                String message = errorCodeService.getErrorMessage("EA003", DEFAULT_LOCALE);
                result.addError(fieldName, message);
            }
        }
    }
}
