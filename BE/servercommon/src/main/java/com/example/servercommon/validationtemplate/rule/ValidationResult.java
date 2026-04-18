// ValidationResult.java
package com.example.servercommon.validationtemplate.rule;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class ValidationResult {
    private int rowNumber;
    private List<ValidationError> errors = new ArrayList<>();

    public ValidationResult(int rowNumber) {
        this.rowNumber = rowNumber;
    }

    public void addError(String field, String message) {
        this.errors.add(new ValidationError(field, message));
    }

    public boolean isValid() {
        return this.errors.isEmpty();
    }

    @Data
    public static class ValidationError {
        private final String field;
        private final String message;
    }
}
