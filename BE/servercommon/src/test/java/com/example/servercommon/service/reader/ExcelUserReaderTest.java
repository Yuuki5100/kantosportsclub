package com.example.servercommon.service.reader;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.UserValidator;
import com.example.servercommon.validation.ValidationResult;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ExcelUserReaderTest {

    private UserValidator userValidator;
    private ErrorCodeService errorCodeService;
    private ExcelUserReader excelUserReader;

    @BeforeEach
    void setUp() {
        userValidator = Mockito.mock(UserValidator.class);
        errorCodeService = Mockito.mock(ErrorCodeService.class);
        excelUserReader = new ExcelUserReader(userValidator, errorCodeService);
    }

    @Test
    void read_whenValidExcel_returnsUsers() throws Exception {
        // Excel ワークブック作成
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet();
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("username");
        header.createCell(1).setCellValue("password");
        header.createCell(2).setCellValue("email");

        Row row1 = sheet.createRow(1);
        row1.createCell(0).setCellValue("user1");
        row1.createCell(1).setCellValue("pass1");
        row1.createCell(2).setCellValue("user1@example.com");

        Row row2 = sheet.createRow(2);
        row2.createCell(0).setCellValue("user2");
        row2.createCell(1).setCellValue("pass2");
        row2.createCell(2).setCellValue("user2@example.com");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        InputStream inputStream = new ByteArrayInputStream(baos.toByteArray());
        List<ValidationResult<UserModel>> results = new ArrayList<>();

        // バリデーションはすべて通る
        Mockito.when(userValidator.validate(Mockito.any(UserModel.class), Mockito.anyInt()))
                .thenAnswer(invocation -> {
                    UserModel u = invocation.getArgument(0);
                    int rowNum = invocation.getArgument(1);
                    return new ValidationResult<>(u, rowNum);
                });

        List<UserModel> users = excelUserReader.read(inputStream, "test.xlsx", results);

        assertThat(users).hasSize(2);
        assertThat(users.get(0).getUserId()).isEqualTo("user1");
        assertThat(users.get(1).getUserId()).isEqualTo("user2");

        assertThat(results).hasSize(2);
        assertThat(results.get(0).isValid()).isTrue();
        assertThat(results.get(1).isValid()).isTrue();
    }

    @Test
    void read_whenValidationFails_addsErrorResults() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet();
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("username");
        header.createCell(1).setCellValue("password");
        header.createCell(2).setCellValue("email");

        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue("user1");
        row.createCell(1).setCellValue("pass1");
        row.createCell(2).setCellValue("user1@example.com");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        InputStream inputStream = new ByteArrayInputStream(baos.toByteArray());
        List<ValidationResult<UserModel>> results = new ArrayList<>();

        // バリデーション失敗
        Mockito.when(userValidator.validate(Mockito.any(UserModel.class), Mockito.anyInt()))
                .thenAnswer(invocation -> {
                    ValidationResult<UserModel> vr = new ValidationResult<>(null, invocation.getArgument(1));
                    vr.addError("Invalid user");
                    return vr;
                });

        Mockito.when(errorCodeService.getErrorMessage(Mockito.anyString(), Mockito.anyList(), Mockito.anyString()))
                .thenReturn("エラー発生");

        List<UserModel> users = excelUserReader.read(inputStream, "test.xlsx", results);

        // バリデーション失敗なので有効ユーザーは0件
        assertThat(users).isEmpty();

        // ValidationResult にエラーが追加される
        assertThat(results).hasSize(1);
        assertThat(results.get(0).isValid()).isFalse();
        assertThat(results.get(0).getErrors()).contains("Invalid user");
    }

    @Test
    void read_whenExceptionDuringParsing_logsErrorAndReturnsEmpty() throws Exception {
        InputStream inputStream = new ByteArrayInputStream(new byte[0]); // 空で例外発生
        List<ValidationResult<UserModel>> results = new ArrayList<>();

        Mockito.when(errorCodeService.getErrorMessage(Mockito.anyString(), Mockito.anyList(), Mockito.anyString()))
                .thenReturn("ファイル読み込みエラー");

        List<UserModel> users = excelUserReader.read(inputStream, "invalid.xlsx", results);

        // CSV読み込みエラーでも例外は飛ばず、結果は空
        assertThat(users).isEmpty();
    }
}
