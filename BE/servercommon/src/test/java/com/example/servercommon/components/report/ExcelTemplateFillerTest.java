package com.example.servercommon.components.report;

import com.example.servercommon.enums.ReportDataType;
import com.example.servercommon.model.ReportLayout;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.*;
import java.nio.file.Path;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

class ExcelTemplateFillerTest {

    private ExcelTemplateFiller filler;

    @BeforeEach
    void setUp() {
        this.filler = new ExcelTemplateFiller();
    }

    @Test
    void テンプレートから出力されたExcelが正しいスタイルと内容を持つ(@TempDir Path tempDir) throws Exception {
        File template = createTemplateWithStyle(tempDir.resolve("template.xlsx"));

        ReportLayout layout1 = new ReportLayout();
        layout1.setPropertyPath("username");
        layout1.setDisplayLabel("ユーザー名");

        ReportLayout layout2 = new ReportLayout();
        layout2.setPropertyPath("email");
        layout2.setDisplayLabel("メール");

        List<ReportLayout> layoutList = List.of(layout1, layout2);

        Map<String, Object> row1 = Map.of("ユーザー名", "taro", "メール", "taro@example.com");
        Map<String, Object> row2 = Map.of("ユーザー名", "jiro", "メール", "jiro@example.com");
        List<Map<String, Object>> data = List.of(row1, row2);

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        filler.fill(template, layoutList, data, out);

        try (InputStream in = new ByteArrayInputStream(out.toByteArray());
                Workbook wb = new XSSFWorkbook(in)) {

            Sheet sheet = wb.getSheetAt(0);
            Row firstRow = sheet.getRow(5); // 5行目から出力想定

            assertThat(firstRow.getCell(0).getStringCellValue()).isEqualTo("taro");
            assertThat(firstRow.getCell(1).getStringCellValue()).isEqualTo("taro@example.com");

            // スタイル確認
            CellStyle originalStyle = wb.getSheetAt(0).getRow(4).getCell(0).getCellStyle();
            CellStyle copiedStyle = firstRow.getCell(0).getCellStyle();
            assertThat(copiedStyle).isNotNull();
            assertThat(copiedStyle.getFontIndex()).isEqualTo(originalStyle.getFontIndex());
        }
    }

    @Test
    void テンプレートファイルが存在しない場合_例外がスローされる() {
        File missing = new File("not_exists.xlsx");
        List<ReportLayout> layoutList = List.of();
        List<Map<String, Object>> data = List.of();

        assertThatThrownBy(() -> filler.fill(missing, layoutList, data, new ByteArrayOutputStream()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Excelテンプレート出力に失敗しました");
    }

    @Test
    void テンプレートスタイルとDB書式がマージされる(@TempDir Path tempDir) throws Exception {
        File template = createMergeTemplate(tempDir.resolve("merge_template.xlsx"));

        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("price");
        layout.setDisplayLabel("価格");
        layout.setDataType(ReportDataType.NUMBER.getCode());
        layout.setFormatPattern("#,##0.0000"); // 小数4桁

        Map<String, Object> row = Map.of("価格", 123.456);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        filler.fill(template, List.of(layout), List.of(row), out);

        try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(out.toByteArray()))) {
            Sheet sheet = wb.getSheetAt(0);
            Cell cell = sheet.getRow(5).getCell(0);

            assertThat(cell.getNumericCellValue()).isEqualTo(123.456);
            assertThat(cell.getCellStyle().getDataFormatString()).contains("0.0000");
            assertThat(cell.getCellStyle().getFontIndex()).isNotZero(); // テンプレのフォント（太字）維持されてるか
        }
    }



    private File createTemplateWithStyle(Path path) throws IOException {
        File file = path.toFile();
        try (Workbook wb = new XSSFWorkbook();
                FileOutputStream fos = new FileOutputStream(file)) {

            Sheet sheet = wb.createSheet("Sheet1");
            Row styleRow = sheet.createRow(4); // 5行目
            Cell styleCell = styleRow.createCell(0);
            CellStyle style = wb.createCellStyle();
            Font font = wb.createFont();
            font.setBold(true);
            style.setFont(font);
            styleCell.setCellStyle(style);
            styleCell.setCellValue("STYLE");

            wb.write(fos);
        }
        return file;
    }

private File createMergeTemplate(Path path) throws IOException {
    File file = path.toFile();
    try (Workbook wb = new XSSFWorkbook(); FileOutputStream fos = new FileOutputStream(file)) {
        Sheet sheet = wb.createSheet("Sheet1");

        Row styleRow = sheet.createRow(4);
        Cell cell = styleRow.createCell(0);

        // 「cell.setCellValue("STYLE");」は削除すること！！
        // ここに値を入れると、STRING型に固定されてしまい後続で上書きできなくなる

        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setDataFormat(wb.createDataFormat().getFormat("#,##0"));
        cell.setCellStyle(style);

        wb.write(fos);
    }
    return file;
}




}
