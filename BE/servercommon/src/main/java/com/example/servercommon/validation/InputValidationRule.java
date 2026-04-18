package com.example.servercommon.validation;

public interface InputValidationRule {
    ValidationResult<?> validate(String fieldName, Object value);
}
