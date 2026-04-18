package com.example.servercommon.validation.validator;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.ValidationResult;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class OrdersFileValidatorTest {

    private ErrorCodeService errorCodeService;
    private OrdersFileValidator validator;

    @BeforeEach
    void setUp() {
        errorCodeService = mock(ErrorCodeService.class);
        validator = new OrdersFileValidator(errorCodeService);
    }

    @Test
    void validate_returnsEmptyErrors_forValidData() throws Exception {
        XSSFWorkbook workbook = new XSSFWorkbook();
        var sheet = workbook.createSheet();
        // ヘッダー行
        var header = sheet.createRow(0);
        header.createCell(0).setCellValue("Name");
        header.createCell(1).setCellValue("Email");
        // データ行
        var row1 = sheet.createRow(1);
        row1.createCell(0).setCellValue("Alice");
        row1.createCell(1).setCellValue("alice@example.com");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        InputStream is = new ByteArrayInputStream(baos.toByteArray());

        List<ValidationResult<UserModel>> results = validator.validate(is);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getErrors()).isEmpty();
        assertThat(results.get(0).getTarget().getUserId()).isEqualTo("Alice");
        assertThat(results.get(0).getTarget().getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    void validate_addsErrors_forInvalidData() throws Exception {
        when(errorCodeService.getErrorMessage("E7001", "ja")).thenReturn("Name is required");
        when(errorCodeService.getErrorMessage("E7002", "ja")).thenReturn("Email is invalid");

        XSSFWorkbook workbook = new XSSFWorkbook();
        var sheet = workbook.createSheet();
        // ヘッダー行
        var header = sheet.createRow(0);
        header.createCell(0).setCellValue("Name");
        header.createCell(1).setCellValue("Email");
        // データ行
        var row1 = sheet.createRow(1);
        row1.createCell(0).setCellValue(""); // 空の名前
        row1.createCell(1).setCellValue("invalidEmail"); // 無効なメール

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        InputStream is = new ByteArrayInputStream(baos.toByteArray());

        List<ValidationResult<UserModel>> results = validator.validate(is);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getErrors()).containsExactly("Name is required", "Email is invalid");
    }

    @Test
    void validate_throwsRuntimeException_onInvalidWorkbook() {
        InputStream invalidStream = new ByteArrayInputStream(new byte[]{0, 1, 2});
        try {
            validator.validate(invalidStream);
        } catch (RuntimeException ex) {
            assertThat(ex.getMessage()).contains("Excelの読み取り中にエラーが発生しました");
        }
    }
}
