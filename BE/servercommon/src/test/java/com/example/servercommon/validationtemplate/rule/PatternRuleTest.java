package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PatternRuleTest {

    private ErrorCodeService errorCodeService;
    private PatternRule rule;

    @BeforeEach
    void setUp() {
        errorCodeService = mock(ErrorCodeService.class);
        when(errorCodeService.getErrorMessage(anyString(), anyString()))
            .thenReturn("形式が不正です");
        rule = new PatternRule(errorCodeService);
    }

    @Test
    void パターンにマッチしない場合はエラーになる() {
        ColumnSchema schema = new ColumnSchema();
        schema.setPattern("^[0-9]{4}$"); // 4桁の数字

        ValidationResult result = new ValidationResult(1);
        rule.validate("code", "abc", schema, result);

        assertFalse(result.isValid());
        assertEquals(1, result.getErrors().size());
        assertTrue(result.getErrors().get(0).getMessage().contains("形式が不正"));
    }

    @Test
    void パターンにマッチすればエラーにならない() {
        ColumnSchema schema = new ColumnSchema();
        schema.setPattern("^[0-9]{4}$");

        ValidationResult result = new ValidationResult(1);
        rule.validate("code", "1234", schema, result);

        assertTrue(result.isValid());
        assertEquals(0, result.getErrors().size());
    }
}
