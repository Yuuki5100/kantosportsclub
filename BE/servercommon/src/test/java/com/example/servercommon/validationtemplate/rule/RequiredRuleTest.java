package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RequiredRuleTest {

    private ErrorCodeService errorCodeService;

    @BeforeEach
    void setUp() {
        errorCodeService = mock(ErrorCodeService.class);
        when(errorCodeService.getErrorMessage(eq("EA004"), anyString()))
                .thenReturn("必須項目です");
    }

    @Test
    void 必須項目が空ならエラーになる() {
        RequiredRule rule = new RequiredRule(errorCodeService, false);
        ColumnSchema schema = new ColumnSchema();
        schema.setRequired(true);

        ValidationResult result = new ValidationResult(1);
        rule.validate("username", "", schema, result);

        assertFalse(result.isValid());
        assertEquals("username", result.getErrors().get(0).getField());
        assertEquals("必須項目です", result.getErrors().get(0).getMessage());
    }

    @Test
    void 必須項目があればエラーにならない() {
        RequiredRule rule = new RequiredRule(errorCodeService, false);
        ColumnSchema schema = new ColumnSchema();
        schema.setRequired(true);

        ValidationResult result = new ValidationResult(1);
        rule.validate("username", "Alice", schema, result);

        assertTrue(result.isValid());
        assertEquals(0, result.getErrors().size());
    }
}
