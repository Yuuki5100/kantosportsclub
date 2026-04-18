package com.example.servercommon.validation;

public interface DbValidationRule {
    ValidationResult<?> validate(String fieldName, Object value);
}
