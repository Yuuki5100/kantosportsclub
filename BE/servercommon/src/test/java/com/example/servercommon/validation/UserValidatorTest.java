package com.example.servercommon.validation;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.service.ErrorCodeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

class UserValidatorTest {

    private ErrorCodeService errorCodeService;
    private UserValidator userValidator;

    @BeforeEach
    void setUp() {
        errorCodeService = Mockito.mock(ErrorCodeService.class);
        userValidator = new UserValidator(errorCodeService);
    }

    @Test
    void validate_returnsNoErrors_forValidUser() {
        UserModel user = new UserModel();
        user.setUserId("Alice");
        user.setPassword("password123");
        user.setEmail("alice@example.com");

        ValidationResult<UserModel> result = userValidator.validate(user, 1);

        assertThat(result.getErrors()).isEmpty();
        assertThat(result.getTarget()).isEqualTo(user);
        assertThat(result.getRowNumber()).isEqualTo(1);
    }

    @Test
    void validate_returnsError_whenUsernameIsBlank() {
        UserModel user = new UserModel();
        user.setUserId("");
        user.setPassword("password123");
        user.setEmail("alice@example.com");

        when(errorCodeService.getErrorMessage("E6001", "ja")).thenReturn("Username is required");

        ValidationResult<UserModel> result = userValidator.validate(user, 2);

        assertThat(result.getErrors()).containsExactly("Username is required");
    }

    @Test
    void validate_returnsError_whenPasswordIsBlank() {
        UserModel user = new UserModel();
        user.setUserId("Alice");
        user.setPassword("");
        user.setEmail("alice@example.com");

        when(errorCodeService.getErrorMessage("E6002", "ja")).thenReturn("Password is required");

        ValidationResult<UserModel> result = userValidator.validate(user, 3);

        assertThat(result.getErrors()).containsExactly("Password is required");
    }

    @Test
    void validate_returnsError_whenEmailIsInvalid() {
        UserModel user = new UserModel();
        user.setUserId("Alice");
        user.setPassword("password123");
        user.setEmail("invalid-email");

        when(errorCodeService.getErrorMessage("E6003", "ja")).thenReturn("Invalid email");

        ValidationResult<UserModel> result = userValidator.validate(user, 4);

        assertThat(result.getErrors()).containsExactly("Invalid email");
    }

    @Test
    void validate_returnsMultipleErrors_whenMultipleFieldsInvalid() {
        UserModel user = new UserModel();
        user.setUserId("");
        user.setPassword("");
        user.setEmail("invalid-email");

        when(errorCodeService.getErrorMessage("E6001", "ja")).thenReturn("Username is required");
        when(errorCodeService.getErrorMessage("E6002", "ja")).thenReturn("Password is required");
        when(errorCodeService.getErrorMessage("E6003", "ja")).thenReturn("Invalid email");

        ValidationResult<UserModel> result = userValidator.validate(user, 5);

        assertThat(result.getErrors())
                .containsExactly("Username is required", "Password is required", "Invalid email");
    }
}
