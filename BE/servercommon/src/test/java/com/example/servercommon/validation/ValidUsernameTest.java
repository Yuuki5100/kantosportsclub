package com.example.servercommon.validation;

import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class ValidUsernameTest {

    private ValidUsername.ValidUsernameValidator validator;

    @BeforeEach
    void setUp() {
        validator = new ValidUsername.ValidUsernameValidator();
        validator.initialize(mock(ValidUsername.class)); // 初期化処理
    }

    @Test
    void isValid_returnsTrue_forValidUsername() {
        assertThat(validator.isValid("Alice123", mock(ConstraintValidatorContext.class))).isTrue();
        assertThat(validator.isValid("Bob2023X", mock(ConstraintValidatorContext.class))).isTrue();
        assertThat(validator.isValid("ABCDEFGH", mock(ConstraintValidatorContext.class))).isTrue();
        assertThat(validator.isValid("12345678", mock(ConstraintValidatorContext.class))).isTrue();
    }

    @Test
    void isValid_returnsFalse_forNullOrInvalidUsername() {
        ConstraintValidatorContext context = mock(ConstraintValidatorContext.class);

        assertThat(validator.isValid(null, context)).isFalse();        // null
        assertThat(validator.isValid("", context)).isFalse();          // 空文字
        assertThat(validator.isValid("abc", context)).isFalse();       // 8文字未満
        assertThat(validator.isValid("abc!@#123", context)).isFalse(); // 記号含む
        assertThat(validator.isValid("abcdefg ", context)).isFalse();  // 空白含む
        assertThat(validator.isValid("abcd_1234", context)).isFalse(); // アンダースコア含む
    }
}
