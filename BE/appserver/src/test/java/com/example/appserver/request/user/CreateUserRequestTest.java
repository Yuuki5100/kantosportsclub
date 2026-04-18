package com.example.appserver.request.user;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.lang.reflect.Method;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CreateUserRequestTest {

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
    // SC02-UT-REQ-001
    // required fields missing -> validation errors
    // =========================================================
    @Test
    void shouldFailValidationWhenRequiredFieldsMissing() {
        CreateUserRequest req = new CreateUserRequest();
        req.setUserId("u1");
        req.setEmail("u1@example.com");
        req.setGivenName(null);
        req.setSurname(null);
        req.setRoleId(null);
        req.setPhoneNo("09000000000");

        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(req);

        assertThat(violations)
                .anyMatch(v -> "givenName".equals(v.getPropertyPath().toString()));
        assertThat(violations)
                .anyMatch(v -> "surname".equals(v.getPropertyPath().toString()));
        assertThat(violations)
                .anyMatch(v -> "roleId".equals(v.getPropertyPath().toString()));
    }

    // =========================================================
    // SC02-UT-REQ-002A
    // email null -> validation error
    // =========================================================
    @Test
    void shouldFailValidationWhenEmailMissing() {
        CreateUserRequest req = new CreateUserRequest();
        req.setUserId("u1");
        req.setEmail(null);
        req.setGivenName("Taro");
        req.setSurname("Yamada");
        req.setRoleId(1);
        req.setPhoneNo("09000000000");

        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(req);

        assertThat(violations)
                .anyMatch(v -> "email".equals(v.getPropertyPath().toString()));
    }

    // =========================================================
    // SC02-UT-REQ-002
    // invalid email format -> validation error
    // =========================================================
    @Test
    void shouldFailValidationWhenEmailFormatInvalid() {
        CreateUserRequest req = new CreateUserRequest();
        req.setUserId("u1");
        req.setEmail("bad");
        req.setGivenName("Taro");
        req.setSurname("Yamada");
        req.setRoleId(1);
        req.setPhoneNo("09000000000");

        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(req);

        assertThat(violations)
                .anyMatch(v -> "email".equals(v.getPropertyPath().toString()));
    }

    // =========================================================
    // SC02-UT-REQ-003
    // roleId null -> validation error
    // =========================================================
    @Test
    void shouldFailValidationWhenRoleIdMissing() {
        CreateUserRequest req = new CreateUserRequest();
        req.setUserId("u1");
        req.setEmail("u1@example.com");
        req.setGivenName("Taro");
        req.setSurname("Yamada");
        req.setRoleId(null);
        req.setPhoneNo("09000000000");

        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(req);

        assertThat(violations)
                .anyMatch(v -> "roleId".equals(v.getPropertyPath().toString()));
    }

    // =========================================================
    // SC02-UT-026
    // timezone invalid format -> validation error
    // =========================================================
    @Test
    void shouldFailValidationWhenTimezoneFormatInvalid() {
        CreateUserRequest req = buildValidRequest();
        assertThat(setTimezoneIfPresent(req, "timezone::Tokyo"))
                .as("CreateUserRequest must have timezone field for SC02-UT-026")
                .isTrue();

        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(req);

        assertThat(violations)
                .anyMatch(v -> "timezone".equals(v.getPropertyPath().toString()));
    }

    // =========================================================
    // SC02-UT-027
    // timezone IANA format -> no validation error
    // =========================================================
    @Test
    void shouldPassValidationWhenTimezoneIsValidIana() {
        CreateUserRequest req = buildValidRequest();
        assertThat(setTimezoneIfPresent(req, "Asia/Tokyo"))
                .as("CreateUserRequest must have timezone field for SC02-UT-027")
                .isTrue();

        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(req);

        assertThat(violations)
                .noneMatch(v -> "timezone".equals(v.getPropertyPath().toString()));
    }

    // =========================================================
    // SC02-UT-028
    // timezone required -> null should fail validation
    // =========================================================
    @Test
    void shouldFailValidationWhenTimezoneMissingIfRequired() {
        CreateUserRequest req = buildValidRequest();
        assertThat(setTimezoneIfPresent(req, null))
                .as("CreateUserRequest must have timezone field for SC02-UT-028")
                .isTrue();

        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(req);

        assertThat(violations)
                .anyMatch(v -> "timezone".equals(v.getPropertyPath().toString()));
    }

    private CreateUserRequest buildValidRequest() {
        CreateUserRequest req = new CreateUserRequest();
        req.setUserId("u1");
        req.setEmail("u1@example.com");
        req.setGivenName("Taro");
        req.setSurname("Yamada");
        req.setRoleId(1);
        req.setPhoneNo("09000000000");
        return req;
    }

    private boolean setTimezoneIfPresent(CreateUserRequest req, String value) {
        try {
            Method setter = req.getClass().getMethod("setTimezone", String.class);
            setter.invoke(req, value);
            return true;
        } catch (NoSuchMethodException e) {
            return false;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
