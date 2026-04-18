package com.example.servercommon.validation;

import java.util.ArrayList;
import java.util.List;
import java.util.function.IntPredicate;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 汎用的な1件単位のバリデーション結果格納クラス
 */
@Data
@AllArgsConstructor
public class ValidationResult<T> {
    private final T target;
    private final int rowNumber;
    private final List<String> errors = new ArrayList<>();

    public void addError(String message) {
        errors.add(message);
    }

    public boolean isValid() {
        return errors.isEmpty();
    }
}
