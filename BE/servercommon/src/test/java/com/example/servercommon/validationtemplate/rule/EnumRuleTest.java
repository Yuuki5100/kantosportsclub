package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EnumRuleTest {

    private ErrorCodeService errorCodeService;

    @BeforeEach
    void setUp() {
        errorCodeService = mock(ErrorCodeService.class);
        when(errorCodeService.getErrorMessage(eq("EA001"), anyList(), anyString()))
            .thenReturn("許可されていない値です: {0}");
    }

    @Test
    void 許可されていない値はエラーになる() {
        EnumRule rule = new EnumRule(errorCodeService);
        ColumnSchema schema = new ColumnSchema();
        schema.setEnumValues(List.of("ADMIN", "USER"));

        ValidationResult result = new ValidationResult(1);
        rule.validate("role", "GUEST", schema, result);

        assertFalse(result.isValid());
        assertEquals("role", result.getErrors().get(0).getField());
        assertNotNull(result.getErrors().get(0).getMessage());
        assertTrue(result.getErrors().get(0).getMessage().contains("許可されていない値"));
    }

    @Test
    void 許可された値はエラーにならない() {
        EnumRule rule = new EnumRule(errorCodeService);
        ColumnSchema schema = new ColumnSchema();
        schema.setEnumValues(List.of("ADMIN", "USER"));

        ValidationResult result = new ValidationResult(1);
        rule.validate("role", "ADMIN", schema, result);

        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }
}
