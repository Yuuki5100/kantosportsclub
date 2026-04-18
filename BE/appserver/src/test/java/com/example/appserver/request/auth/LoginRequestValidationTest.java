package com.example.appserver.request.auth;

import jakarta.validation.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
@ActiveProfiles("test")

class LoginRequestValidationTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("ユーザー名とパスワードが空でバリデーションエラーが発生する")
    void shouldFailValidationWhenUsernameAndPasswordAreBlank() {
        LoginRequest request = new LoginRequest("", "  ");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).hasSize(2);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("username"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("password"));
    }

    @Test
    @DisplayName("ユーザー名がnullの場合バリデーションエラー")
    void shouldFailValidationWhenUsernameIsNull() {
        LoginRequest request = new LoginRequest(null, "password");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("username"));
    }

    @Test
    @DisplayName("パスワードがnullの場合バリデーションエラー")
    void shouldFailValidationWhenPasswordIsNull() {
        LoginRequest request = new LoginRequest("user", null);

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("password"));
    }

    @Test
    @DisplayName("正しい入力でバリデーションエラーが発生しない")
    void shouldPassValidationWhenValidInput() {
        LoginRequest request = new LoginRequest("user", "password");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }
}
