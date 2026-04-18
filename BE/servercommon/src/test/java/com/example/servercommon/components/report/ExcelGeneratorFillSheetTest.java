package com.example.servercommon.components.report;

import com.example.servercommon.enums.ReportDataType;
import com.example.servercommon.model.ReportLayout;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Calendar;
import java.util.Date;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ExcelGeneratorFillSheetTest {

    private ExcelGenerator excelGenerator;
    private Workbook workbook;
    private Sheet sheet;

    @BeforeEach
    void setUp() {
        excelGenerator = new ExcelGenerator(new ExcelTemplateFiller());
        workbook = new XSSFWorkbook();
        sheet = workbook.createSheet("TestSheet");
    }

    @Test
    void 数値は小数点以下3桁に切り捨てられて書き込まれる() {
        ReportLayout numberLayout = new ReportLayout();
        numberLayout.setDisplayLabel("金額");
        numberLayout.setPropertyPath("amount");
        numberLayout.setDataType(ReportDataType.NUMBER.getCode());

        Map<String, Object> rowData = Map.of("amount", 1234.56789);
        excelGenerator.fillSheet(List.of(numberLayout), List.of(rowData), sheet);

        Cell cell = sheet.getRow(1).getCell(0);
        assertThat(cell.getNumericCellValue()).isEqualTo(1234.567);
    }

    @Test
    void 文字列型がそのまま出力される() {
        ReportLayout stringLayout = new ReportLayout();
        stringLayout.setDisplayLabel("名前");
        stringLayout.setPropertyPath("name");
        stringLayout.setDataType(ReportDataType.STRING.getCode());

        Map<String, Object> rowData = Map.of("name", "山田太郎");
        excelGenerator.fillSheet(List.of(stringLayout), List.of(rowData), sheet);

        Cell cell = sheet.getRow(1).getCell(0);
        assertThat(cell.getStringCellValue()).isEqualTo("山田太郎");
    }

    @Test
    void 真偽値型がbooleanとして出力される() {
        ReportLayout boolLayout = new ReportLayout();
        boolLayout.setDisplayLabel("有効");
        boolLayout.setPropertyPath("enabled");
        boolLayout.setDataType(ReportDataType.BOOLEAN.getCode());

        Map<String, Object> rowData = Map.of("enabled", true);
        excelGenerator.fillSheet(List.of(boolLayout), List.of(rowData), sheet);

        Cell cell = sheet.getRow(1).getCell(0);
        assertThat(cell.getBooleanCellValue()).isTrue();
    }

    @Test
    void カスタムフォーマットなしでもデフォルト書式が設定される() {
        ReportLayout currencyLayout = new ReportLayout();
        currencyLayout.setDisplayLabel("価格");
        currencyLayout.setPropertyPath("price");
        currencyLayout.setDataType(ReportDataType.CURRENCY.getCode());

        Map<String, Object> rowData = Map.of("price", 9876.5432);
        excelGenerator.fillSheet(List.of(currencyLayout), List.of(rowData), sheet);

        Cell cell = sheet.getRow(1).getCell(0);
        assertThat(cell.getNumericCellValue()).isEqualTo(9876.5432);
        assertThat(cell.getCellStyle().getDataFormatString()).contains("¥").contains("0");
    }

    @Test
    void 日付型が正しく書式付きで出力される() {
        ReportLayout dateLayout = new ReportLayout();
        dateLayout.setDisplayLabel("登録日");
        dateLayout.setPropertyPath("createdAt");
        dateLayout.setDataType(ReportDataType.DATE.getCode());

        // java.util.Date を使う（Excel が解釈できる）
        Date today = Date.from(LocalDate.of(2025, 7, 22).atStartOfDay(ZoneId.systemDefault()).toInstant());
        Map<String, Object> rowData = Map.of("createdAt", today);

        excelGenerator.fillSheet(List.of(dateLayout), List.of(rowData), sheet);

        Cell cell = sheet.getRow(1).getCell(0);
        assertThat(cell.getDateCellValue()).isEqualTo(today);
        assertThat(cell.getCellStyle().getDataFormatString().toLowerCase()).contains("yy");
    }

    @Test
    void yyyyMM形式が1日補完でDateに変換される() {
        ExcelTemplateFiller filler = new ExcelTemplateFiller();
        Date result = filler.parseDate("2024/07");
        Calendar cal = Calendar.getInstance();
        cal.setTime(result);

        assertThat(cal.get(Calendar.YEAR)).isEqualTo(2024);
        assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.JULY); // 0-based
        assertThat(cal.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
    }

    @Test
    void DATE型に対してDate_LocalDate_yyyyMMを渡したとき正しく出力される() {
        ReportLayout dateLayout = new ReportLayout();
        dateLayout.setDisplayLabel("日付");
        dateLayout.setPropertyPath("date");
        dateLayout.setDataType(ReportDataType.DATE.getCode());

        Date date1 = new Date(); // java.util.Date（今日）
        LocalDate localDate = LocalDate.of(2024, 6, 15);
        String ym = "2025/07";

        List<Map<String, Object>> rows = List.of(
                Map.of("date", date1),
                Map.of("date", localDate),
                Map.of("date", ym));

        excelGenerator.fillSheet(List.of(dateLayout), rows, sheet);

        // 検証
        // 1行目：java.util.Date
        Cell cell1 = sheet.getRow(1).getCell(0);
        assertThat(cell1.getDateCellValue()).isEqualToIgnoringHours(date1);

        // 2行目：LocalDate → Date
        Cell cell2 = sheet.getRow(2).getCell(0);
        assertThat(cell2.getDateCellValue()).isEqualTo(java.sql.Date.valueOf(localDate));

        // 3行目："yyyy/MM" → LocalDate → Date(2025-07-01)
        Cell cell3 = sheet.getRow(3).getCell(0);
        Calendar cal = Calendar.getInstance();
        cal.setTime(cell3.getDateCellValue());
        assertThat(cal.get(Calendar.YEAR)).isEqualTo(2025);
        assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.JULY); // 0-based
        assertThat(cal.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
    }

    @Test
    void NUMBER型に対してBigDecimal_double_Stringを渡したとき正しく出力される() {
        ReportLayout numberLayout = new ReportLayout();
        numberLayout.setDisplayLabel("数値");
        numberLayout.setPropertyPath("value"); // ← これに合わせる

        numberLayout.setDataType(ReportDataType.NUMBER.getCode());

        List<Map<String, Object>> rows = List.of(
                Map.of("value", new BigDecimal("123.45678")),
                Map.of("value", 234.56789),
                Map.of("value", "345.67891"));

        excelGenerator.fillSheet(List.of(numberLayout), rows, sheet);

        double[] expected = { 123.456, 234.567, 345.678 };

        for (int i = 0; i < expected.length; i++) {
            Cell cell = sheet.getRow(1 + i).getCell(0);
            assertThat(cell.getNumericCellValue()).isEqualTo(expected[i]);
        }
    }

    @Test
    void 各データ型にnullを渡したとき空セルまたは初期値として出力される() {
        List<ReportLayout> layouts = List.of(
                createLayout("str", "文字列", ReportDataType.STRING),
                createLayout("num", "数値", ReportDataType.NUMBER),
                createLayout("cur", "通貨", ReportDataType.CURRENCY),
                createLayout("bool", "真偽", ReportDataType.BOOLEAN),
                createLayout("date", "日付", ReportDataType.DATE));

        Map<String, Object> row = Map.of(); // すべてnull相当

        excelGenerator.fillSheet(layouts, List.of(row), sheet);
        Row dataRow = sheet.getRow(1);

        assertThat(dataRow.getCell(0).getStringCellValue()).isEmpty(); // STRING
        assertThat(dataRow.getCell(1).getNumericCellValue()).isEqualTo(0.0); // NUMBER
        assertThat(dataRow.getCell(2).getNumericCellValue()).isEqualTo(0.0); // CURRENCY
        assertThat(dataRow.getCell(3).getBooleanCellValue()).isFalse(); // BOOLEAN
        assertThat(dataRow.getCell(4)).isNotNull(); // DATE 空でもセルはある
    }

    @Test
    void カスタムフォーマットがformatPatternで上書きされる() {
        ReportLayout customLayout = new ReportLayout();
        customLayout.setDisplayLabel("金額");
        customLayout.setPropertyPath("amount");
        customLayout.setDataType(ReportDataType.NUMBER.getCode());
        customLayout.setFormatPattern("#,##0.0000"); // 4桁小数まで表示

        Map<String, Object> rowData = Map.of("amount", 123.456);
        excelGenerator.fillSheet(List.of(customLayout), List.of(rowData), sheet);

        Cell cell = sheet.getRow(1).getCell(0);
        assertThat(cell.getNumericCellValue()).isEqualTo(123.456); // Generator側で3桁に丸めている前提
        assertThat(cell.getCellStyle().getDataFormatString()).contains("0.0000"); // formatPatternが反映されているか
    }

    @Test
    void 各データ型に応じたセル出力と書式が適用される() throws Exception {
        // 準備: レイアウト定義
        List<ReportLayout> layouts = List.of(
                createLayout("name", "名前", ReportDataType.STRING),
                createLayout("score", "得点", ReportDataType.NUMBER),
                createLayout("price", "金額", ReportDataType.CURRENCY),
                createLayout("birth", "生年月日", ReportDataType.DATE),
                createLayout("active", "有効", ReportDataType.BOOLEAN),
                createLayout("custom", "カスタム", ReportDataType.CUSTOM, "000-000"));

        // データ
        Map<String, Object> row = Map.of(
                "name", "田中",
                "score", 1234.567,
                "price", 1234.5,
                "birth", LocalDate.of(2024, 5, 1),
                "active", "true",
                "custom", "123456");

        // 出力
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Test");
        excelGenerator.fillSheet(layouts, List.of(row), sheet);

        // 検証
        Row dataRow = sheet.getRow(1);
        assertThat(dataRow.getCell(0).getStringCellValue()).isEqualTo("田中");

        assertThat(dataRow.getCell(1).getNumericCellValue()).isEqualTo(1234.567); // 小数第3位で切り捨て
        assertThat(getCellFormatString(dataRow.getCell(1))).isEqualTo("#,##0.###");

        assertThat(dataRow.getCell(2).getNumericCellValue()).isEqualTo(1234.5);
        assertThat(getCellFormatString(dataRow.getCell(2))).contains("¥");

        assertThat(dataRow.getCell(3).getDateCellValue()).isNotNull();
        assertThat(getCellFormatString(dataRow.getCell(3))).contains("yyyy");

        assertThat(dataRow.getCell(4).getBooleanCellValue()).isTrue();

        assertThat(dataRow.getCell(5).getStringCellValue()).isEqualTo("123456");
        assertThat(getCellFormatString(dataRow.getCell(5))).contains("000-000");
    }

    // ヘルパー: ReportLayout 作成
    private ReportLayout createLayout(String propertyPath, String label, ReportDataType type) {
        return createLayout(propertyPath, label, type, null);
    }

    private ReportLayout createLayout(String propertyPath, String label, ReportDataType type, String pattern) {
        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath(propertyPath);
        layout.setDisplayLabel(label);
        layout.setDataType(type.getCode());
        layout.setFormatPattern(pattern);
        return layout;
    }

    // ヘルパー: セルの formatString を取得
    private String getCellFormatString(Cell cell) {
        CellStyle style = cell.getCellStyle();
        if (style == null)
            return "";
        short formatIndex = style.getDataFormat();
        DataFormat dataFormat = cell.getSheet().getWorkbook().createDataFormat();
        return style.getDataFormatString();
    }

}
