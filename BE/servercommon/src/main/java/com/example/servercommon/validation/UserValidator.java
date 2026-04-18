package com.example.servercommon.validation;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.service.ErrorCodeService;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * User エンティティ専用のバリデーションクラス
 */
@Component
public class UserValidator {

    private final ErrorCodeService errorCodeService;
    private static final String DEFAULT_LOCALE = "ja";

    public UserValidator(ErrorCodeService errorCodeService) {
        this.errorCodeService = errorCodeService;
    }

    public ValidationResult<UserModel> validate(UserModel user, int rowNumber) {
        ValidationResult<UserModel> result = new ValidationResult<>(user, rowNumber);

        if (user.getUserId() == null || user.getUserId().isBlank()) {
            result.addError(errorCodeService.getErrorMessage("E6001", DEFAULT_LOCALE));
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            result.addError(errorCodeService.getErrorMessage("E6002", DEFAULT_LOCALE));
        }

        if (user.getEmail() == null || !user.getEmail().matches("^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$")) {
            result.addError(errorCodeService.getErrorMessage("E6003", DEFAULT_LOCALE));
        }

        return result;
    }
}
