package com.example.servercommon.validationtemplate;

import java.io.File;
import java.io.FileOutputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.example.servercommon.validationtemplate.rule.ValidationResult;

/**
 * エラーのある行を含んだExcelファイル
 */

public class ValidationErrorExcelExporter {
    public File exportWithErrors(List<Map<String, String>> rows,
                                  List<ValidationResult> results,
                                  String outputPath) throws Exception {

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Validation Errors");

        // エラーマップ作成: rowNumber => "field1 - message1, field2 - message2"
        Map<Integer, String> errorMap = results.stream()
            .filter(r -> !r.isValid())
            .collect(Collectors.toMap(
                ValidationResult::getRowNumber,
                r -> r.getErrors().stream()
                      .map(e -> e.getField() + " - " + e.getMessage())
                      .reduce((a, b) -> a + ", " + b)
                      .orElse(""),
                (v1, v2) -> v1  // 重複することは基本的にない
            ));

        // ヘッダー出力
        if (!rows.isEmpty()) {
            Map<String, String> firstRow = rows.get(0);
            Row headerRow = sheet.createRow(0);
            int colIdx = 0;
            for (String col : firstRow.keySet()) {
                headerRow.createCell(colIdx++).setCellValue(col);
            }
            headerRow.createCell(colIdx).setCellValue("エラーメッセージ");
        }

        // 各行出力
        for (int i = 0; i < rows.size(); i++) {
            Map<String, String> rowMap = rows.get(i);
            Row row = sheet.createRow(i + 1);
            int colIdx = 0;
            for (String val : rowMap.values()) {
                row.createCell(colIdx++).setCellValue(val);
            }
            String errMsg = errorMap.getOrDefault(i + 1, "");
            row.createCell(colIdx).setCellValue(errMsg);
        }

        // ファイル保存
        File file = new File(outputPath);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            workbook.write(fos);
        }
        workbook.close();
        return file;
    }
}
