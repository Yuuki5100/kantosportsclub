package com.example.servercommon.validation;

import java.util.ArrayList;
import java.util.List;

public class FileValidationResult<T> {

    private final List<ValidationResult<T>> results = new ArrayList<>();

    public void addResult(ValidationResult<T> result) {
        results.add(result);
    }

    public List<ValidationResult<T>> getResults() {
        return results;
    }

    public boolean isAllValid() {
        return results.stream().allMatch(ValidationResult::isValid);
    }

    public List<ValidationResult<T>> getInvalidResults() {
        return results.stream().filter(r -> !r.isValid()).toList();
    }
}
