package com.example.servercommon.validationtemplate.reader;

import com.example.servercommon.exception.FileImportException;
import com.example.servercommon.message.BackendMessageCatalog;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
public class ExcelRecordReader implements FileRecordReader {

    @Override
    public List<Map<String, String>> read(InputStream inputStream) {
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            log.info(BackendMessageCatalog.LOG_EXCEL_FIRST_SHEET_READ, sheet.getSheetName());
            return readSheetInternal(sheet);
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_EXCEL_FIRST_SHEET_READ_FAILED, e);
            throw new FileImportException(BackendMessageCatalog.EX_EXCEL_FIRST_SHEET_READ_FAILED, e);
        }
    }

    public List<Map<String, String>> readSheet(InputStream inputStream, String sheetName) {
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheet(sheetName);
            if (sheet == null) {
                log.warn(BackendMessageCatalog.LOG_EXCEL_SHEET_NOT_FOUND, sheetName);
                throw new FileImportException(BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_SHEET_NOT_FOUND, sheetName));
            }
            log.info(BackendMessageCatalog.LOG_EXCEL_SPECIFIED_SHEET_READ, sheetName);
            return readSheetInternal(sheet);
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_EXCEL_SPECIFIED_SHEET_READ_FAILED, sheetName, e);
            throw new FileImportException(
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_SPECIFIED_SHEET_READ_FAILED, sheetName), e);
        }
    }

    private List<Map<String, String>> readSheetInternal(Sheet sheet) {
        Iterator<Row> rowIterator = sheet.iterator();
        if (!rowIterator.hasNext()) {
            throw new FileImportException(
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_SHEET_NO_DATA, sheet.getSheetName()));
        }

        // ヘッダーの読み取り
        Row headerRow = rowIterator.next();
        List<String> headers = new ArrayList<>();
        for (Cell cell : headerRow) {
            String value = Optional.ofNullable(cell.getStringCellValue()).orElse("").trim();
            if (value.isEmpty()) {
                throw new FileImportException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_EMPTY_HEADER_COLUMN, sheet.getSheetName()));
            }
            headers.add(value);
        }

        if (headers.isEmpty()) {
            throw new FileImportException(
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_HEADER_EMPTY, sheet.getSheetName()));
        }

        // データ行の読み取り
        List<Map<String, String>> rows = new ArrayList<>();
        FormulaEvaluator evaluator = sheet.getWorkbook().getCreationHelper().createFormulaEvaluator();

        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();
            Map<String, String> record = new LinkedHashMap<>();

            for (int i = 0; i < headers.size(); i++) {
                Cell cell = row.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                String cellValue = parseCellValue(cell, evaluator);
                record.put(headers.get(i), cellValue);
            }

            // 空行スキップ（全カラムが空）
            boolean isEmpty = record.values().stream().allMatch(String::isEmpty);
            if (!isEmpty) {
                rows.add(record);
            }
        }

        if (rows.isEmpty()) {
            throw new FileImportException(
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_EXCEL_NO_ROWS, sheet.getSheetName()));
        }

        return rows;
    }

    private String parseCellValue(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return "";
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();

            case BOOLEAN:
                return Boolean.toString(cell.getBooleanCellValue());

            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    return formatNumericValue(cell.getNumericCellValue());
                }

            case FORMULA:
                try {
                    CellValue evaluated = evaluator.evaluate(cell);
                    if (evaluated == null) return "";
                    return switch (evaluated.getCellType()) {
                        case BOOLEAN -> Boolean.toString(evaluated.getBooleanValue());
                        case NUMERIC -> formatNumericValue(evaluated.getNumberValue());
                        case STRING -> evaluated.getStringValue().trim();
                        default -> "";
                    };
                } catch (Exception e) {
                    return "";
                }

            default:
                return cell.toString().trim();
        }
    }

    private String formatNumericValue(double value) {
        BigDecimal decimal = BigDecimal.valueOf(value);

        if (decimal.compareTo(BigDecimal.ZERO) == 0) {
            return "0";
        }

        BigDecimal truncated = decimal.setScale(3, RoundingMode.DOWN);
        return truncated.toPlainString();
    }
}
