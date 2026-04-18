package com.example.servercommon.components.report;

import com.example.servercommon.model.ReportLayout;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.*;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

class ExcelGeneratorTest {

    private ExcelGenerator excelGenerator;

    @BeforeEach
    void setUp() {
        this.excelGenerator = new ExcelGenerator(new ExcelTemplateFiller());
    }

    @Test
    void テンプレートにヘッダーが正しく出力される(@TempDir Path tempDir) throws Exception {
        File templateFile = createEmptyTemplate(tempDir.resolve("template.xlsx"));

        ReportLayout layout1 = new ReportLayout();
        layout1.setPropertyPath("username");
        layout1.setDisplayLabel("ユーザー名");

        ReportLayout layout2 = new ReportLayout();
        layout2.setPropertyPath("email");
        layout2.setDisplayLabel("メールアドレス");

        List<ReportLayout> layoutData = List.of(layout1, layout2);
        List<Map<String, Object>> dummyData = List.of(); // 空でもOK
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        excelGenerator.fillTemplate(templateFile, layoutData, dummyData, out);

        assertThat(out.toByteArray()).isNotEmpty();
    }

    @Test
    void テンプレートファイルが存在しない場合_例外がスローされる() {
        File nonExistentFile = new File("not_found.xlsx");
        List<ReportLayout> layouts = List.of();
        List<Map<String, Object>> data = List.of();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        assertThatThrownBy(() -> excelGenerator.fillTemplate(nonExistentFile, layouts, data, out))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Excelテンプレート出力に失敗しました");
    }

    @Test
    void テンプレートファイルが破損している場合_例外がスローされる(@TempDir Path tempDir) throws Exception {
        File brokenFile = tempDir.resolve("broken.xlsx").toFile();
        try (FileWriter fw = new FileWriter(brokenFile)) {
            fw.write("これはExcelファイルではありません");
        }

        List<ReportLayout> layouts = List.of();
        List<Map<String, Object>> data = List.of();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Throwable thrown = catchThrowable(() -> excelGenerator.fillTemplate(brokenFile, layouts, data, out));

        assertThat(thrown)
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Excelテンプレート出力に失敗しました");
    }

    @Test
    void レイアウトデータが空でも例外が発生しない(@TempDir Path tempDir) throws Exception {
        File templateFile = createEmptyTemplate(tempDir.resolve("template.xlsx"));

        List<ReportLayout> emptyLayouts = List.of();
        List<Map<String, Object>> emptyData = List.of();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        assertThatCode(() -> excelGenerator.fillTemplate(templateFile, emptyLayouts, emptyData, out))
                .doesNotThrowAnyException();

        assertThat(out.toByteArray()).isNotEmpty();
    }

    private File createEmptyTemplate(Path path) throws IOException {
        File file = path.toFile();
        try (Workbook wb = new XSSFWorkbook(); FileOutputStream fos = new FileOutputStream(file)) {
            wb.createSheet("Sheet1");
            wb.write(fos);
        }
        return file;
    }
}
