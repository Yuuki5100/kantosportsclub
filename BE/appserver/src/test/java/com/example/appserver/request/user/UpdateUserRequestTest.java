package com.example.appserver.request.user;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UpdateUserRequestTest {

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
    // SC02-UT-040
    // update: invalid email format -> validation error
    // =========================================================
    @Test
    void shouldFailValidationWhenEmailFormatInvalidEvenOnUpdate() {
        UpdateUserRequest req = new UpdateUserRequest();
        req.setEmail("email:bad");
        req.setGivenName("Taro");
        req.setSurname("Yamada");
        req.setRoleId(1);
        req.setPhoneNo("09000000000");

        Set<ConstraintViolation<UpdateUserRequest>> violations = validator.validate(req);

        assertThat(violations)
                .anyMatch(v -> "email".equals(v.getPropertyPath().toString()));
    }
}
