package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;

import java.util.List;

public class MaxLengthRule implements ValidationRule {

    private final ErrorCodeService errorCodeService;
    private static final String DEFAULT_LOCALE = "ja";

    public MaxLengthRule(ErrorCodeService errorCodeService) {
        this.errorCodeService = errorCodeService;
    }

    @Override
    public void validate(String fieldName, String value, ColumnSchema schema, ValidationResult result) {
        if (schema.getMaxLength() != null && value != null && value.length() > schema.getMaxLength()) {
            String message = errorCodeService.getErrorMessage("EA002", List.of(schema.getMaxLength()), DEFAULT_LOCALE);
            result.addError(fieldName, message);
        }
    }
}
