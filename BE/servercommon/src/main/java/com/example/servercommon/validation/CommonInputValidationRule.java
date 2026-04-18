package com.example.servercommon.validation;

import com.example.servercommon.service.ErrorCodeService;
import lombok.AllArgsConstructor;

import java.util.List;

@AllArgsConstructor
public class CommonInputValidationRule implements InputValidationRule {

    private final CommonValidator validator;
    private final ErrorCodeService errorCodeService;

    private static final String DEFAULT_LOCALE = "ja";

    @Override
    public ValidationResult<?> validate(String fieldName, Object value) {
        ValidationResult<?> result = new ValidationResult<>(null, -1);
        String str = (value == null) ? "" : value.toString();

        if (validator.isRequired() && str.trim().isEmpty()) {
            result.addError(errorCodeService.getErrorMessage("E1001", List.of(fieldName), DEFAULT_LOCALE));
        }

        if (validator.getMaxLength() != null && str.length() > validator.getMaxLength()) {
            result.addError(errorCodeService.getErrorMessage(
                    "E1002", List.of(fieldName, validator.getMaxLength()), DEFAULT_LOCALE));
        }

        if (validator.getMinLength() != null && str.length() < validator.getMinLength()) {
            result.addError(errorCodeService.getErrorMessage(
                    "E1003", List.of(fieldName, validator.getMinLength()), DEFAULT_LOCALE));
        }

        if (validator.getPattern() != null && !str.matches(validator.getPattern())) {
            result.addError(errorCodeService.getErrorMessage("E1004", List.of(fieldName), DEFAULT_LOCALE));
        }

        if (validator.isEmail() && !str.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            result.addError(errorCodeService.getErrorMessage("E1005", List.of(fieldName), DEFAULT_LOCALE));
        }

        if (validator.isNumericOnly() && !str.matches("^\\d+$")) {
            result.addError(errorCodeService.getErrorMessage("E1006", List.of(fieldName), DEFAULT_LOCALE));
        }

        if (validator.isPhoneNumberFormat() && !str.matches("^\\d{2,4}-\\d{2,4}-\\d{3,4}$")) {
            result.addError(errorCodeService.getErrorMessage("E1007", List.of(fieldName), DEFAULT_LOCALE));
        }

        if (validator.isPostalCodeFormat() && !str.matches("^\\d{3}-\\d{4}$")) {
            result.addError(errorCodeService.getErrorMessage("E1008", List.of(fieldName), DEFAULT_LOCALE));
        }

        return result;
    }
}
