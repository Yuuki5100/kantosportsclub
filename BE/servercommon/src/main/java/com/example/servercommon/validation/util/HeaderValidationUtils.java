package com.example.servercommon.validation.util;

import com.example.servercommon.message.BackendMessageCatalog;
import org.apache.commons.csv.CSVParser;
import org.apache.poi.ss.usermodel.*;
import java.util.*;
import java.util.stream.Collectors;

public class HeaderValidationUtils {

    private static final Map<String, List<String>> EXPECTED_HEADERS = Map.of(
        "users", List.of("username", "password", "email", "role"),
        "orders", List.of("orderId", "userId", "item", "quantity", "price")
        // 必要に応じて拡張
    );

    /**
     * CSVヘッダー検証（Apache Commons CSV）
     */
    public static void validateCsvHeaders(String fileType, CSVParser parser) {
        List<String> expected = EXPECTED_HEADERS.get(fileType);
        if (expected == null) {
            throw new IllegalArgumentException(BackendMessageCatalog.format(BackendMessageCatalog.EX_UNSUPPORTED_FILE_TYPE_JA, fileType));
        }

        Set<String> actualHeaders = parser.getHeaderMap().keySet().stream()
                .map(String::trim)
                .collect(Collectors.toSet());

        if (!actualHeaders.containsAll(expected)) {
            throw new RuntimeException(BackendMessageCatalog.format(
                    BackendMessageCatalog.EX_CSV_HEADER_INVALID, expected, actualHeaders));
        }
    }

    /**
     * Excelヘッダー検証（Apache POI）
     */
    public static void validateExcelHeaders(String fileType, Sheet sheet) {
        List<String> expected = EXPECTED_HEADERS.get(fileType);
        if (expected == null) {
            throw new IllegalArgumentException(BackendMessageCatalog.format(BackendMessageCatalog.EX_UNSUPPORTED_FILE_TYPE_JA, fileType));
        }

        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            throw new RuntimeException(BackendMessageCatalog.EX_EXCEL_HEADER_ROW_MISSING);
        }

        List<String> actualHeaders = new ArrayList<>();
        for (Cell cell : headerRow) {
            actualHeaders.add(cell.getStringCellValue().trim());
        }

        if (!actualHeaders.containsAll(expected)) {
            throw new RuntimeException(BackendMessageCatalog.format(
                    BackendMessageCatalog.EX_EXCEL_HEADER_INVALID, expected, actualHeaders));
        }
    }
}
