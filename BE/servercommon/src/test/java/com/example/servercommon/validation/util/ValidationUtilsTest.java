package com.example.servercommon.validation.util;

import com.example.servercommon.validation.ValidationResult;
import org.apache.commons.csv.CSVRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ValidationUtilsTest {

    private CSVRecord record;
    private ValidationResult<Object> result;

    enum SampleEnum { VALUE1, VALUE2 }

    @BeforeEach
    void setUp() {
        record = mock(CSVRecord.class);
        result = new ValidationResult<>(null, -1);
    }

    @Test
    void requireNotBlank_addsError_whenValueIsNullOrEmpty() {
        when(record.get("field")).thenReturn(null);
        ValidationUtils.requireNotBlank(record, "field", result, "field required");
        assertThat(result.getErrors()).containsExactly("field required");

        result.getErrors().clear();
        when(record.get("field")).thenReturn("   ");
        ValidationUtils.requireNotBlank(record, "field", result, "field required");
        assertThat(result.getErrors()).containsExactly("field required");
    }

    @Test
    void requireNotBlank_doesNotAddError_whenValueIsPresent() {
        when(record.get("field")).thenReturn("value");
        ValidationUtils.requireNotBlank(record, "field", result, "field required");
        assertThat(result.getErrors()).isEmpty();
    }

    @Test
    void validateEmail_addsError_whenEmailIsInvalid() {
        ValidationUtils.validateEmail(null, result, "invalid email");
        assertThat(result.getErrors()).containsExactly("invalid email");

        result.getErrors().clear();
        ValidationUtils.validateEmail("invalidEmail", result, "invalid email");
        assertThat(result.getErrors()).containsExactly("invalid email");
    }

    @Test
    void validateEmail_doesNotAddError_whenEmailIsValid() {
        ValidationUtils.validateEmail("test@example.com", result, "invalid email");
        assertThat(result.getErrors()).isEmpty();
    }

    @Test
    void safeParseEnum_returnsEnum_whenValid() {
        Optional<SampleEnum> parsed = ValidationUtils.safeParseEnum("VALUE1", SampleEnum.class, result, "invalid enum");
        assertThat(parsed).contains(SampleEnum.VALUE1);
        assertThat(result.getErrors()).isEmpty();
    }

    @Test
    void safeParseEnum_addsError_whenInvalidOrEmpty() {
        Optional<SampleEnum> parsed = ValidationUtils.safeParseEnum("INVALID", SampleEnum.class, result, "invalid enum");
        assertThat(parsed).isEmpty();
        assertThat(result.getErrors()).containsExactly("invalid enum");

        result.getErrors().clear();
        parsed = ValidationUtils.safeParseEnum("", SampleEnum.class, result, "invalid enum");
        assertThat(parsed).isEmpty();
        assertThat(result.getErrors()).containsExactly("invalid enum");

        result.getErrors().clear();
        parsed = ValidationUtils.safeParseEnum(null, SampleEnum.class, result, "invalid enum");
        assertThat(parsed).isEmpty();
        assertThat(result.getErrors()).containsExactly("invalid enum");
    }
}

