package com.example.servercommon.validationtemplate.reader;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

public class TestExcelUtils {

    /**
     * List<Map<String,String>> のデータから簡易的な Excel ファイルを作成し、
     * ByteArrayInputStream として返す
     */
    public static ByteArrayInputStream createExcelStream(List<Map<String, String>> rows) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");

        if (!rows.isEmpty()) {
            // ヘッダー行作成
            Row header = sheet.createRow(0);
            int colIndex = 0;
            for (String colName : rows.get(0).keySet()) {
                header.createCell(colIndex++).setCellValue(colName);
            }

            // データ行作成
            for (int i = 0; i < rows.size(); i++) {
                Row row = sheet.createRow(i + 1);
                Map<String, String> data = rows.get(i);
                colIndex = 0;
                for (String value : data.values()) {
                    row.createCell(colIndex++).setCellValue(value);
                }
            }
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        return new ByteArrayInputStream(out.toByteArray());
    }
}
