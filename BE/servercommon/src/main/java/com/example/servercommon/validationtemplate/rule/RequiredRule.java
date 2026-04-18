package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;

import java.util.List;

public class RequiredRule implements ValidationRule {

    private final boolean isRequiredOverride;
    private final ErrorCodeService errorCodeService;
    private static final String DEFAULT_LOCALE = "ja";

    public RequiredRule(ErrorCodeService errorCodeService) {
        this(errorCodeService, false);
    }

    public RequiredRule(ErrorCodeService errorCodeService, boolean isRequiredOverride) {
        this.errorCodeService = errorCodeService;
        this.isRequiredOverride = isRequiredOverride;
    }

    @Override
    public void validate(String fieldName, String value, ColumnSchema schema, ValidationResult result) {
        boolean required = isRequiredOverride || Boolean.TRUE.equals(schema.isRequired());
        if (required && (value == null || value.trim().isEmpty())) {
            String message = errorCodeService.getErrorMessage("EA004", DEFAULT_LOCALE);
            result.addError(fieldName, message);
        }
    }
}
