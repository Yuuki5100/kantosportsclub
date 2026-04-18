package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.service.ErrorCodeService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ValidationRuleRegistryTest {

    @Test
    void デフォルトルールが3つ含まれていること() {
        ErrorCodeService errorCodeService = mock(ErrorCodeService.class);
        List<ValidationRule> rules = ValidationRuleRegistry.getDefaultRules(errorCodeService);

        assertNotNull(rules);
        assertEquals(3, rules.size());
        assertTrue(rules.stream().anyMatch(r -> r instanceof EnumRule));
        assertTrue(rules.stream().anyMatch(r -> r instanceof MaxLengthRule));
        assertTrue(rules.stream().anyMatch(r -> r instanceof PatternRule));
    }
}
