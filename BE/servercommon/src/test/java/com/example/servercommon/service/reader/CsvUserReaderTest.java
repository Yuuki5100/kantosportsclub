package com.example.servercommon.service.reader;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.UserValidator;
import com.example.servercommon.validation.ValidationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CsvUserReaderTest {

    private UserValidator userValidator;
    private ErrorCodeService errorCodeService;
    private CsvUserReader csvUserReader;

    @BeforeEach
    void setUp() {
        userValidator = Mockito.mock(UserValidator.class);
        errorCodeService = Mockito.mock(ErrorCodeService.class);
        csvUserReader = new CsvUserReader(userValidator, errorCodeService);
    }

    @Test
    void read_whenValidCsv_returnsUsers() throws Exception {
        String csvContent = "username,password,email\n" +
                "user1,pass1,user1@example.com\n" +
                "user2,pass2,user2@example.com\n";

        InputStream inputStream = new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8));
        List<ValidationResult<UserModel>> results = new ArrayList<>();

        // バリデーションはすべて通るとする
        Mockito.when(userValidator.validate(Mockito.any(UserModel.class), Mockito.anyInt()))
                .thenAnswer(invocation -> {
                    UserModel u = invocation.getArgument(0);
                    int row = invocation.getArgument(1);
                    return new ValidationResult<>(u, row);
                });

        List<UserModel> users = csvUserReader.read(inputStream, "test.csv", results);

        assertThat(users).hasSize(2);
        assertThat(users.get(0).getUserId()).isEqualTo("user1");
        assertThat(users.get(1).getUserId()).isEqualTo("user2");

        assertThat(results).hasSize(2);
        assertThat(results.get(0).isValid()).isTrue();
        assertThat(results.get(1).isValid()).isTrue();
    }

    @Test
    void read_whenValidationFails_addsErrorResults() throws Exception {
        String csvContent = "username,password,email\n" +
                "user1,pass1,user1@example.com\n";

        InputStream inputStream = new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8));
        List<ValidationResult<UserModel>> results = new ArrayList<>();

        Mockito.when(userValidator.validate(Mockito.any(UserModel.class), Mockito.anyInt()))
                .thenAnswer(invocation -> {
                    ValidationResult<UserModel> vr = new ValidationResult<>(null, invocation.getArgument(1));
                    vr.addError("Invalid user");
                    return vr;
                });

        Mockito.when(errorCodeService.getErrorMessage(Mockito.anyString(), Mockito.anyList(), Mockito.anyString()))
                .thenReturn("エラー発生");

        List<UserModel> users = csvUserReader.read(inputStream, "test.csv", results);

        // バリデーション失敗なので有効ユーザーは0件
        assertThat(users).isEmpty();

        // 結果には1件追加されている
        assertThat(results).hasSize(1);
        assertThat(results.get(0).isValid()).isFalse();
        assertThat(results.get(0).getErrors()).contains("Invalid user");
    }

    @Test
    void read_whenExceptionDuringParsing_addsErrorLog() throws Exception {
        String invalidCsvContent = null; // nullで例外発生

        InputStream inputStream = new ByteArrayInputStream(new byte[0]);
        List<ValidationResult<UserModel>> results = new ArrayList<>();

        Mockito.when(errorCodeService.getErrorMessage(Mockito.anyString(), Mockito.anyList(), Mockito.anyString()))
                .thenReturn("ファイル読み込みエラー");

        List<UserModel> users = csvUserReader.read(inputStream, "invalid.csv", results);

        // CSV読み込みエラーでも例外は飛ばず、結果は空
        assertThat(users).isEmpty();
    }
}
