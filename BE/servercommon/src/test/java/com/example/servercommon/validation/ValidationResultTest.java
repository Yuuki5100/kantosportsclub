package com.example.servercommon.validation;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ValidationResultTest {

    @Test
    void testInitialValidationResult_IsValid() {
        ValidationResult<String> result = new ValidationResult<>("testData", 1);

        assertEquals("testData", result.getTarget());
        assertEquals(1, result.getRowNumber());
        assertTrue(result.isValid(), "初期状態ではエラーはなく有効");
        assertTrue(result.getErrors().isEmpty(), "初期エラーリストは空");
    }

    @Test
    void testAddError_AddsErrorAndIsInvalid() {
        ValidationResult<String> result = new ValidationResult<>("testData", 2);

        result.addError("Error 1");

        assertFalse(result.isValid(), "エラーを追加した後は無効になる");
        List<String> errors = result.getErrors();
        assertEquals(1, errors.size(), "エラーリストに1件追加される");
        assertEquals("Error 1", errors.get(0));
    }

    @Test
    void testAddMultipleErrors() {
        ValidationResult<String> result = new ValidationResult<>("data", 3);

        result.addError("Error A");
        result.addError("Error B");

        assertFalse(result.isValid(), "複数エラー追加後も無効");
        List<String> errors = result.getErrors();
        assertEquals(2, errors.size(), "エラーリストに2件追加される");
        assertEquals("Error A", errors.get(0));
        assertEquals("Error B", errors.get(1));
    }

    @Test
    void testGenericTypeValidationResult() {
        ValidationResult<Integer> result = new ValidationResult<>(100, 10);

        assertEquals(100, result.getTarget());
        assertEquals(10, result.getRowNumber());
        assertTrue(result.isValid(), "整数型でも初期状態は有効");
    }

    @Test
    void testErrorsListIsIndependentBetweenInstances() {
        ValidationResult<String> result1 = new ValidationResult<>("one", 1);
        ValidationResult<String> result2 = new ValidationResult<>("two", 2);

        result1.addError("Error for one");

        assertEquals(1, result1.getErrors().size());
        assertTrue(result2.getErrors().isEmpty(), "別インスタンスのエラーリストは影響を受けない");
    }
}
