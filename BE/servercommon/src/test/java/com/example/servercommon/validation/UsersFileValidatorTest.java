package com.example.servercommon.validation;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.validator.UsersFileValidator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
class UsersFileValidatorTest {

    private UsersFileValidator validator;

@BeforeEach
void setUp() {
    ErrorCodeService stubErrorService = new ErrorCodeService(null) {
        @Override
        public String getErrorMessage(String code, String locale) {
            return switch (code) {
                case "E8001" -> "名前が未入力です";
                case "E8002" -> "パスワードが未入力です";
                case "E8003" -> "メールアドレスの形式が不正です";
                case "E8004" -> "ロールが不正です";
                case "E8005" -> "ロールが未入力です";
                case "E8006" -> "列数が不正です";
                case "E8007" -> "CSVの読み取り中にエラーが発生しました";
                default -> "Unknown error";
            };
        }
    };

    validator = new UsersFileValidator(stubErrorService);
}


    private InputStream toInputStream(String content) {
        return new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    @DisplayName("✅ 正常系：1レコード正しくバリデートできる")
    void shouldValidateValidUser() {
        String csv = "username,email,password,role\n" +
                "alice,alice@example.com,password123,VIEWER\n";

        List<ValidationResult<UserModel>> results = validator.validate(toInputStream(csv));

        assertThat(results).hasSize(1);
        assertThat(results.get(0).isValid()).isTrue();
        assertThat(results.get(0).getTarget().getRoleId()).isEqualTo(UserRole.VIEWER.getRoleId());
    }

    @Test
    @DisplayName("❌ 異常系：空行スキップ or 列不足を検知")
    void shouldDetectColumnCountMismatch() {
        String csv = "username,email,password,role\n" +
                "bob,bob@example.com,password123\n";

        InputStream inputStream = toInputStream(csv);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            validator.validate(inputStream);
        });

        assertEquals("列数が不正です", ex.getMessage());
        assertNotNull(ex.getCause());
        assertTrue(ex.getCause() instanceof IllegalArgumentException);
    }

    @Test
    @DisplayName("❌ 異常系：メール形式不正")
    void shouldDetectInvalidEmailFormat() {
        String csv = "username,email,password,role\n" +
                "bob,bob-at-example.com,password123,EDITOR\n";

        List<ValidationResult<UserModel>> results = validator.validate(toInputStream(csv));

        assertThat(results).hasSize(1);
        assertThat(results.get(0).isValid()).isFalse();
        assertThat(results.get(0).getErrors()).anyMatch(msg -> msg.contains("メールアドレスの形式が不正"));
    }

    @Test
    @DisplayName("❌ 異常系：パスワード未入力")
    void shouldDetectBlankPassword() {
        String csv = "username,email,password,role\n" +
                "bob,bob@example.com,,EDITOR\n";

        List<ValidationResult<UserModel>> results = validator.validate(toInputStream(csv));

        assertThat(results).hasSize(1);
        assertThat(results.get(0).isValid()).isFalse();
        assertThat(results.get(0).getErrors()).contains("パスワードが未入力です");
    }

    @Test
    @DisplayName("❌ 異常系：無効なロール")
    void shouldDetectInvalidRoleAndDefaultToNull() {
        String csv = "username,email,password,role\n" +
                "bob,bob@example.com,password123,INVALID\n";

        List<ValidationResult<UserModel>> results = validator.validate(toInputStream(csv));

        assertThat(results).hasSize(1);
        assertThat(results.get(0).isValid()).isFalse();
        assertThat(results.get(0).getErrors()).contains("ロールが不正です");
    }

    @Test
    @DisplayName("✅ ヘッダーだけ → 結果0件")
    void shouldSkipHeaderOnly() {
        String csv = "username,email,password,role\n";

        List<ValidationResult<UserModel>> results = validator.validate(toInputStream(csv));

        assertThat(results).isEmpty();
    }
}
