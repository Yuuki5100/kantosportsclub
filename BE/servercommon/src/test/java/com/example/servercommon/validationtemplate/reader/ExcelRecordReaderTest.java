package com.example.servercommon.validationtemplate.reader;

import com.example.servercommon.exception.FileImportException;
import com.example.servercommon.message.BackendMessageCatalog;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ExcelRecordReaderTest {

    ExcelRecordReader reader = new ExcelRecordReader();

    @Test
    void 正常に先頭シートを読み込める() {
        InputStream is = getClass().getResourceAsStream("/fixtures/valid.xlsx");
        assertNotNull(is, "テストデータが存在しません: valid.xlsx");

        List<Map<String, String>> result = reader.read(is);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals("Alice", result.get(0).get("name"));
    }

    @Test
    void 指定シートが存在しないと例外が発生する() {
        InputStream is = getClass().getResourceAsStream("/fixtures/valid.xlsx");
        assertNotNull(is, "テストデータが存在しません: valid.xlsx");

        FileImportException ex = assertThrows(FileImportException.class,
                () -> reader.readSheet(is, "NoSuchSheet"));
        assertEquals(
                BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_SPECIFIED_SHEET_READ_FAILED, "NoSuchSheet"),
                ex.getMessage());
        assertNotNull(ex.getCause());
        assertEquals(
                BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_SHEET_NOT_FOUND, "NoSuchSheet"),
                ex.getCause().getMessage());
    }

    @Test
    void ヘッダー行が空だと例外が発生する() {
        InputStream is = getClass().getResourceAsStream("/fixtures/missing_header.xlsx");
        assertNotNull(is, "テストデータが存在しません: missing_header.xlsx");

        FileImportException ex = assertThrows(FileImportException.class,
                () -> reader.read(is));
        assertEquals(BackendMessageCatalog.EX_EXCEL_FIRST_SHEET_READ_FAILED, ex.getMessage());
        assertNotNull(ex.getCause());
        assertEquals(
                BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_EMPTY_HEADER_COLUMN, "Sheet1"),
                ex.getCause().getMessage());
    }

    @Test
    void ヘッダー行のみのシートを読み込むと例外が発生する() {
        // Arrange: テスト用Excel（ヘッダー行だけ存在）
        InputStream is = getClass().getResourceAsStream("/fixtures/header_only.xlsx");
        assertNotNull(is, "テストデータが存在しません: header_only.xlsx");

        FileImportException ex = assertThrows(FileImportException.class, () -> reader.read(is));
        assertEquals(BackendMessageCatalog.EX_EXCEL_FIRST_SHEET_READ_FAILED, ex.getMessage());
        assertNotNull(ex.getCause());
        assertEquals(
                BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_NO_ROWS, "Sheet1"),
                ex.getCause().getMessage());
    }

    @Test
    void 空のシートを読み込むと例外が発生する() {
        InputStream is = getClass().getResourceAsStream("/fixtures/empty_sheet.xlsx");
        assertNotNull(is, "テストデータが存在しません: empty_sheet.xlsx");

        FileImportException ex = assertThrows(FileImportException.class,
                () -> reader.read(is));
        assertEquals(BackendMessageCatalog.EX_EXCEL_FIRST_SHEET_READ_FAILED, ex.getMessage());
        assertTrue(ex.getCause() instanceof FileImportException);
        assertEquals(
                BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_SHEET_NO_DATA, "Sheet1"),
                ex.getCause().getMessage());
    }

    @Test
    void 日付セルや数値セルが正しく読み取れる() {
        InputStream is = getClass().getResourceAsStream("/fixtures/date_and_number.xlsx");
        assertNotNull(is, "テストデータが存在しません: date_and_number.xlsx");

        List<Map<String, String>> result = reader.read(is);
        Map<String, String> record = result.get(0);

        assertEquals("2024-01-01", record.get("birthDate"));
        assertEquals(0, new BigDecimal(record.get("age")).compareTo(new BigDecimal("30"))); // ← 修正
    }

    @Test
    void 小数点や指数表記の数値セルが正確に読み取れる() {
        InputStream is = getClass().getResourceAsStream("/fixtures/decimal_numbers.xlsx");
        assertNotNull(is, "テストデータが存在しません: decimal_numbers.xlsx");

        List<Map<String, String>> result = reader.read(is);
        Map<String, String> record = result.get(0);

    assertEquals("123.456", record.get("value1"));
    assertEquals("0", record.get("value2"));
    assertEquals("100.000", record.get("value3"));
    }

}
