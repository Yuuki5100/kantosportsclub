package com.example.servercommon.validationtemplate;

import com.example.servercommon.validation.ValidationError;
import com.example.servercommon.validationtemplate.rule.ValidationResult;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

class ValidationErrorExcelExporterTest {

    private ValidationErrorExcelExporter exporter;

    @BeforeEach
    void setUp() {
        exporter = new ValidationErrorExcelExporter();
    }

    @Test
    void exportWithErrors_createsExcel_withErrors() throws Exception {
        List<Map<String, String>> rows = new ArrayList<>();
        Map<String, String> row1 = new LinkedHashMap<>();
        row1.put("Name", "Alice");
        row1.put("Email", "alice@example.com");
        rows.add(row1);

        Map<String, String> row2 = new LinkedHashMap<>();
        row2.put("Name", "");
        row2.put("Email", "bob@example.com");
        rows.add(row2);

        // ValidationResult は rowNumber で生成
        ValidationResult vr1 = new ValidationResult(1); // row 1
        ValidationResult vr2 = new ValidationResult(2); // row 2
        vr2.addError("Name", "必須項目");

        List<ValidationResult> results = Arrays.asList(vr1, vr2);

        File tmpFile = File.createTempFile("test", ".xlsx");
        tmpFile.deleteOnExit();

        File outFile = exporter.exportWithErrors(rows, results, tmpFile.getAbsolutePath());
        assertThat(outFile.exists()).isTrue();

        // Excel 中身確認
        try (FileInputStream fis = new FileInputStream(outFile);
                Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0);
            Row header = sheet.getRow(0);
            assertThat(header.getCell(0).getStringCellValue()).isEqualTo("Name");
            assertThat(header.getCell(1).getStringCellValue()).isEqualTo("Email");
            assertThat(header.getCell(2).getStringCellValue()).isEqualTo("エラーメッセージ");

            Row dataRow1 = sheet.getRow(1);
            assertThat(dataRow1.getCell(0).getStringCellValue()).isEqualTo("Alice");
            assertThat(dataRow1.getCell(1).getStringCellValue()).isEqualTo("alice@example.com");
            assertThat(dataRow1.getCell(2).getStringCellValue()).isEmpty();

            Row dataRow2 = sheet.getRow(2);
            assertThat(dataRow2.getCell(0).getStringCellValue()).isEqualTo("");
            assertThat(dataRow2.getCell(1).getStringCellValue()).isEqualTo("bob@example.com");
            assertThat(dataRow2.getCell(2).getStringCellValue()).contains("Name - 必須項目");
        }
    }

    @Test
    void exportWithErrors_createsExcel_withEmptyRows() throws Exception {
        List<Map<String, String>> rows = new ArrayList<>();
        List<ValidationResult> results = new ArrayList<>();
        File tmpFile = File.createTempFile("empty", ".xlsx");
        tmpFile.deleteOnExit();

        File outFile = exporter.exportWithErrors(rows, results, tmpFile.getAbsolutePath());
        assertThat(outFile.exists()).isTrue();

        try (FileInputStream fis = new FileInputStream(outFile);
                Workbook workbook = new XSSFWorkbook(fis)) {
            Sheet sheet = workbook.getSheetAt(0);
            assertThat(sheet.getPhysicalNumberOfRows()).isEqualTo(0);
        }
    }
}
