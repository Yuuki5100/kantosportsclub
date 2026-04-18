package com.example.servercommon.validationtemplate.reader;

import com.example.servercommon.exception.FileImportException;
import com.example.servercommon.message.BackendMessageCatalog;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FileRecordReaderDispatcherTest {

    private FileRecordReaderDispatcher dispatcher;

    @BeforeEach
    void setUp() {
        dispatcher = new FileRecordReaderDispatcher();
    }

    @Test
    void read_csvFile_success() {
        String csv = "name,email\nAlice,alice@example.com\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes());
        List<Map<String, String>> result = dispatcher.read("test.csv", is);

        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsEntry("name", "Alice")
                .containsEntry("email", "alice@example.com");
    }

    @Test
    void read_excelFile_success() throws Exception {
        // 簡易ExcelをByteArrayInputStreamで作成
        InputStream is = TestExcelUtils.createExcelStream(
                List.of(Map.of("name", "Bob", "email", "bob@example.com")));
        List<Map<String, String>> result = dispatcher.read("test.xlsx", is);

        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsEntry("name", "Bob")
                .containsEntry("email", "bob@example.com");
    }

    @Test
    void read_unsupportedFile_throwsException() {
        InputStream is = new ByteArrayInputStream(new byte[] {});
        FileImportException ex = assertThrows(FileImportException.class,
                () -> dispatcher.read("test.txt", is));
        assertThat(ex.getMessage()).isEqualTo(
                BackendMessageCatalog.format(BackendMessageCatalog.EX_FILE_READ_FAILED, "test.txt"));
        assertThat(ex.getCause()).isInstanceOf(FileImportException.class);
        assertThat(ex.getCause().getMessage()).isEqualTo(
                BackendMessageCatalog.format(BackendMessageCatalog.EX_UNSUPPORTED_FILE_TYPE, "test.txt"));
    }

    @Test
    void read_nullOrBlankFilename_throwsException() {
        InputStream is = new ByteArrayInputStream(new byte[] {});
        assertThrows(FileImportException.class, () -> dispatcher.read(null, is));
        assertThrows(FileImportException.class, () -> dispatcher.read(" ", is));
    }

    @Test
    void readSheet_excel_success() throws Exception {
        InputStream is = TestExcelUtils.createExcelStream(
                List.of(Map.of("col1", "val1")));
        List<Map<String, String>> result = dispatcher.readSheet("test.xlsx", "Sheet1", is);

        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsEntry("col1", "val1");
    }

    @Test
    void readSheet_nonExcel_throwsException() {
        InputStream is = new ByteArrayInputStream(new byte[] {});
        FileImportException ex = assertThrows(FileImportException.class,
                () -> dispatcher.readSheet("test.csv", "Sheet1", is));
        assertThat(ex.getMessage()).isEqualTo(
                BackendMessageCatalog.format(BackendMessageCatalog.EX_SHEET_READ_ONLY_EXCEL, "test.csv"));
    }
}
