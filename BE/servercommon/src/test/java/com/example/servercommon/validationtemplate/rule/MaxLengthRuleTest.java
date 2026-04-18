package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MaxLengthRuleTest {

    private ErrorCodeService errorCodeService;
    private MaxLengthRule rule;

    @BeforeEach
    void setUp() {
        errorCodeService = mock(ErrorCodeService.class);
        when(errorCodeService.getErrorMessage(anyString(), anyList(), anyString()))
            .thenReturn("最大長を超えています");
        rule = new MaxLengthRule(errorCodeService);
    }

    @Test
    void 文字列長が最大を超えるとエラーになる() {
        ColumnSchema schema = new ColumnSchema();
        schema.setMaxLength(5);

        ValidationResult result = new ValidationResult(1);
        rule.validate("note", "abcdef", schema, result);

        assertFalse(result.isValid());
        assertEquals(1, result.getErrors().size());
        assertTrue(result.getErrors().get(0).getMessage().contains("最大長"));
    }

    @Test
    void 文字列長が許容範囲ならエラーにならない() {
        ColumnSchema schema = new ColumnSchema();
        schema.setMaxLength(10);

        ValidationResult result = new ValidationResult(1);
        rule.validate("note", "abc", schema, result);

        assertTrue(result.isValid());
        assertEquals(0, result.getErrors().size());
    }
}
