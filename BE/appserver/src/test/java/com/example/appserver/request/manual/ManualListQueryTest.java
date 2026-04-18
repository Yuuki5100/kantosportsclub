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

class ManualListQueryTest {

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
    // MANUAL-UT-077
    // pageNumber < 1 -> validation error (@Min(1))
    // =========================================================
    @Test
    void shouldFailWhenPageNumberLessThan1() {
        ManualListQuery q = new ManualListQuery();
        q.setPageNumber(0);

        Set<ConstraintViolation<ManualListQuery>> violations = validator.validate(q);

        assertThat(violations)
                .anyMatch(v -> "pageNumber".equals(v.getPropertyPath().toString()));
    }

    // =========================================================
    // MANUAL-UT-078
    // pagesize > 50 -> validation error (@Max(50))
    // =========================================================
    @Test
    void shouldFailWhenPageSizeGreaterThan50() {
        ManualListQuery q = new ManualListQuery();
        q.setPagesize(51);

        Set<ConstraintViolation<ManualListQuery>> violations = validator.validate(q);

        assertThat(violations)
                .anyMatch(v -> "pagesize".equals(v.getPropertyPath().toString()));
    }
}
