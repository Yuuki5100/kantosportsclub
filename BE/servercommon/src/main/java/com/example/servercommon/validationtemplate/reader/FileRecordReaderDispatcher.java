package com.example.servercommon.validationtemplate.reader;

import com.example.servercommon.exception.FileImportException;
import com.example.servercommon.message.BackendMessageCatalog;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class FileRecordReaderDispatcher {

    private final CsvRecordReader csvReader = new CsvRecordReader();
    private final ExcelRecordReader excelReader = new ExcelRecordReader();

    /**
     * 既存：拡張子によってCSVかExcelかを自動判定（単一シート）
     */
    public List<Map<String, String>> read(String filename, InputStream inputStream) {
        if (filename == null || filename.isBlank()) {
            throw new FileImportException(BackendMessageCatalog.EX_INVALID_FILE_NAME);
        }

        String lower = filename.toLowerCase();
        try {
            if (lower.endsWith(".csv")) {
                log.info(BackendMessageCatalog.LOG_CSV_READ_START, filename);
                return csvReader.read(inputStream);
            } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
                log.info(BackendMessageCatalog.LOG_EXCEL_READ_START, filename);
                return excelReader.read(inputStream);
            } else {
                log.warn(BackendMessageCatalog.LOG_UNSUPPORTED_FILE_TYPE, filename);
                throw new FileImportException(BackendMessageCatalog.format(BackendMessageCatalog.EX_UNSUPPORTED_FILE_TYPE, filename));
            }
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_FILE_READ_FAILED, filename, e);
            throw new FileImportException(BackendMessageCatalog.format(BackendMessageCatalog.EX_FILE_READ_FAILED, filename), e);
        }
    }

    /**
     * 新規：Excelファイルの特定シートを読み込む（マルチシート対応用）
     */
    public List<Map<String, String>> readSheet(String filename, String sheetName, InputStream inputStream) {
        if (filename == null || filename.isBlank()) {
            throw new FileImportException(BackendMessageCatalog.EX_INVALID_FILE_NAME);
        }

        String lower = filename.toLowerCase();
        try {
            if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
                return excelReader.readSheet(inputStream, sheetName);
            } else {
                throw new FileImportException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_SHEET_READ_ONLY_EXCEL, filename));
            }
        } catch (FileImportException e) {
            // 既に FileImportException はそのままスロー
            throw e;
        } catch (Exception e) {
            throw new FileImportException(BackendMessageCatalog.format(BackendMessageCatalog.EX_SHEET_READ_FAILED, sheetName), e);
        }
    }
}
