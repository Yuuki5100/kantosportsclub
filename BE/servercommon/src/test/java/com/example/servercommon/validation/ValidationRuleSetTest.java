package com.example.servercommon.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ValidationRuleSetTest {

    private ValidationRuleSet ruleSet;
    private CommonInputValidationRule inputRuleMock;
    private DbCommonValidationRule dbRuleMock;

    @BeforeEach
    void setUp() {
        ruleSet = new ValidationRuleSet();
        inputRuleMock = mock(CommonInputValidationRule.class);
        dbRuleMock = mock(DbCommonValidationRule.class);
    }

    @Test
    void validate_returnsEmptyList_whenNoRulesAdded() {
        Map<String, Object> input = Map.of("field1", "value1");
        List<ValidationResult<?>> results = ruleSet.validate(input);
        assertThat(results).isEmpty();
    }

    @Test
    void validate_appliesInputRules_andCollectsErrors() {
        // ValidationResult を事前に作成
        ValidationResult<?> vr = new ValidationResult<>(null, -1); // ワイルドカード型
        vr.addError("input error");

        // ワイルドカードにキャストして返す
        when(inputRuleMock.validate(eq("field1"), eq("badValue"))).thenReturn((ValidationResult) vr);

        ruleSet.addInputRule("field1", inputRuleMock);
        Map<String, Object> input = Map.of("field1", "badValue");

        List<ValidationResult<?>> results = ruleSet.validate(input);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getErrors()).containsExactly("input error");
        verify(inputRuleMock, times(1)).validate("field1", "badValue");
    }

    @Test
    void validate_appliesDbRules_andCollectsErrors() {
        ValidationResult<?> vr = new ValidationResult<>(null, -1);
        vr.addError("db error");

        when(dbRuleMock.validate(eq("field2"), eq("badDbValue"))).thenReturn((ValidationResult) vr);

        ruleSet.addDbRule("field2", dbRuleMock);
        Map<String, Object> input = Map.of("field2", "badDbValue");

        List<ValidationResult<?>> results = ruleSet.validate(input);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getErrors()).containsExactly("db error");
        verify(dbRuleMock, times(1)).validate("field2", "badDbValue");
    }

    @Test
    void validate_combinesInputAndDbErrors() {
        ValidationResult<?> vrInput = new ValidationResult<>(null, -1);
        vrInput.addError("input error");

        ValidationResult<?> vrDb = new ValidationResult<>(null, -1);
        vrDb.addError("db error");

        when(inputRuleMock.validate(eq("field1"), eq("val"))).thenReturn((ValidationResult) vrInput);
        when(dbRuleMock.validate(eq("field2"), eq("val2"))).thenReturn((ValidationResult) vrDb);

        ruleSet.addInputRule("field1", inputRuleMock);
        ruleSet.addDbRule("field2", dbRuleMock);

        Map<String, Object> input = Map.of(
                "field1", "val",
                "field2", "val2");

        List<ValidationResult<?>> results = ruleSet.validate(input);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getErrors()).containsExactly("input error");
        assertThat(results.get(1).getErrors()).containsExactly("db error");
    }
}
