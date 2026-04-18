package com.example.servercommon.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.example.servercommon.service.ErrorCodeService;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CommonInputValidationRuleTest {

    private CommonValidator validator;
    private ErrorCodeService errorCodeService;
    private CommonInputValidationRule rule;

    @BeforeEach
    void setUp() {
        validator = new CommonValidator();
        errorCodeService = Mockito.mock(ErrorCodeService.class);
        rule = new CommonInputValidationRule(validator, errorCodeService);
    }

    @Test
    void validate_requiredField_emptyValue_addsError() {
        validator.setRequired(true);
        Mockito.when(errorCodeService.getErrorMessage("E1001", List.of("field1"), "ja"))
                .thenReturn("Required field");

        var result = rule.validate("field1", "");

        assertThat(result.getErrors()).containsExactly("Required field");
    }

    @Test
    void validate_maxLength_exceeded_addsError() {
        validator.setMaxLength(5);
        Mockito.when(errorCodeService.getErrorMessage("E1002", List.of("field2", 5), "ja"))
                .thenReturn("Max length exceeded");

        var result = rule.validate("field2", "123456");

        assertThat(result.getErrors()).containsExactly("Max length exceeded");
    }

    @Test
    void validate_minLength_notMet_addsError() {
        validator.setMinLength(3);
        Mockito.when(errorCodeService.getErrorMessage("E1003", List.of("field3", 3), "ja"))
                .thenReturn("Min length not met");

        var result = rule.validate("field3", "12");

        assertThat(result.getErrors()).containsExactly("Min length not met");
    }

    @Test
    void validate_patternMismatch_addsError() {
        validator.setPattern("^\\d+$");
        Mockito.when(errorCodeService.getErrorMessage("E1004", List.of("field4"), "ja"))
                .thenReturn("Pattern mismatch");

        var result = rule.validate("field4", "abc");

        assertThat(result.getErrors()).containsExactly("Pattern mismatch");
    }

    @Test
    void validate_emailFormat_invalid_addsError() {
        validator.setEmail(true);
        Mockito.when(errorCodeService.getErrorMessage("E1005", List.of("emailField"), "ja"))
                .thenReturn("Invalid email");

        var result = rule.validate("emailField", "invalid-email");

        assertThat(result.getErrors()).containsExactly("Invalid email");
    }

    @Test
    void validate_numericOnly_invalid_addsError() {
        validator.setNumericOnly(true);
        Mockito.when(errorCodeService.getErrorMessage("E1006", List.of("numField"), "ja"))
                .thenReturn("Not numeric");

        var result = rule.validate("numField", "abc123");

        assertThat(result.getErrors()).containsExactly("Not numeric");
    }

    @Test
    void validate_phoneNumberFormat_invalid_addsError() {
        validator.setPhoneNumberFormat(true);
        Mockito.when(errorCodeService.getErrorMessage("E1007", List.of("phoneField"), "ja"))
                .thenReturn("Invalid phone");

        var result = rule.validate("phoneField", "12345");

        assertThat(result.getErrors()).containsExactly("Invalid phone");
    }

    @Test
    void validate_postalCodeFormat_invalid_addsError() {
        validator.setPostalCodeFormat(true);
        Mockito.when(errorCodeService.getErrorMessage("E1008", List.of("postalField"), "ja"))
                .thenReturn("Invalid postal code");

        var result = rule.validate("postalField", "1234567");

        assertThat(result.getErrors()).containsExactly("Invalid postal code");
    }

    @Test
    void validate_validValue_noErrors() {
        validator.setRequired(true);
        validator.setMaxLength(10);
        validator.setMinLength(1);
        validator.setPattern("^\\w+$");
        validator.setEmail(false);
        validator.setNumericOnly(false);
        validator.setPhoneNumberFormat(false);
        validator.setPostalCodeFormat(false);

        var result = rule.validate("field", "validValue");

        assertThat(result.getErrors()).isEmpty();
    }
}
