package com.example.appserver.request.manual;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ManualCreateRequestTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        if (factory != null) factory.close();
    }

    // =========================================================
    // MANUAL-UT-075
    // manualTitle blank -> validation error (@NotBlank)
    // =========================================================
    @Test
    void shouldFailWhenManualTitleBlank() {
        ManualCreateRequest req = new ManualCreateRequest();
        req.setManualTitle(""); // blank
        req.setDescription("d");

        Set<ConstraintViolation<ManualCreateRequest>> violations = validator.validate(req);

        assertThat(violations)
                .anyMatch(v -> "manualTitle".equals(v.getPropertyPath().toString()));
    }

    // =========================================================
    // MANUAL-UT-076
    // manualTitle length 21 -> validation error (@Size(max=20))
    // =========================================================
    @Test
    void shouldFailWhenManualTitleTooLong() {
        ManualCreateRequest req = new ManualCreateRequest();
        req.setManualTitle("a".repeat(21)); // 21 chars (max 20)
        req.setDescription("d");

        Set<ConstraintViolation<ManualCreateRequest>> violations = validator.validate(req);

        assertThat(violations)
                .anyMatch(v -> "manualTitle".equals(v.getPropertyPath().toString()));
    }
}
