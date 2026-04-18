package com.example.servercommon.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ValidUsername.ValidUsernameValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidUsername {
    String message() default "Invalid username. It must be alphanumeric and at least 8 characters long.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    
    // 内部クラスとしてバリデーションロジックを定義
    class ValidUsernameValidator implements ConstraintValidator<ValidUsername, String> {

        @Override
        public void initialize(ValidUsername constraintAnnotation) {
            // 初期化が必要な場合はここに記述
        }

        @Override
        public boolean isValid(String value, ConstraintValidatorContext context) {
            if (value == null) {
                return false;  // null は無効とする場合
            }
            // 英数字のみかつ8文字以上かどうかをチェックする
            return value.matches("^[a-zA-Z0-9]{8,}$");
        }
    }
}
