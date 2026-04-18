package com.example.servercommon.components.report;

import com.example.servercommon.message.BackendMessageCatalog;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import com.example.servercommon.enums.ReportDataType;
import com.example.servercommon.model.ReportLayout;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ExcelTemplateFiller {

    public void fill(File template, List<ReportLayout> layout, List<Map<String, Object>> data, OutputStream out) {
        try (FileInputStream fis = new FileInputStream(template);
                XSSFWorkbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0);
            int startRowIndex = findFirstEmptyRow(sheet, 5);
            Row styleRow = sheet.getRow(startRowIndex - 1);
            List<CellStyle> cellStyles = extractColumnStyles(styleRow, layout.size(), workbook);

            for (int rowIndex = 0; rowIndex < data.size(); rowIndex++) {
                Map<String, Object> rowData = data.get(rowIndex);
                Row row = sheet.createRow(startRowIndex + rowIndex);

                for (int colIndex = 0; colIndex < layout.size(); colIndex++) {
                    ReportLayout colDef = layout.get(colIndex);
                    String key = colDef.getDisplayLabel();
                    Object value = rowData.get(key);

                    Cell cell = row.createCell(colIndex);

                    // 型と書式の決定
                    ReportDataType dataType = ReportDataType.fromCode(colDef.getDataType());
                    String formatPattern = colDef.getFormatPattern();

                    // 値の型優先解釈
                    try {
                        switch (dataType) {
                            case NUMBER:
                            case CURRENCY:
                                double numValue = parseNumber(value);
                                cell.setCellValue(numValue);
                                break;
                            case DATE:
                                Date dateValue = parseDate(value);
                                cell.setCellValue(dateValue);
                                break;
                            case BOOLEAN:
                                boolean boolVal = parseBoolean(value);
                                cell.setCellValue(boolVal);
                                break;
                            case STRING:
                            case CUSTOM:
                            default:
                                cell.setCellValue(value != null ? value.toString() : "");
                                break;
                        }
                    } catch (Exception ex) {
                        cell.setCellValue("変換エラー: " + value);
                    }

                    // スタイルの適用
                    CellStyle baseStyle = colIndex < cellStyles.size()
                            ? cellStyles.get(colIndex)
                            : workbook.createCellStyle();

                    CellStyle mergedStyle = mergeStyleWithDataType(baseStyle, dataType, workbook, formatPattern);
                    if (mergedStyle != null) {
                        cell.setCellStyle(mergedStyle);
                    }
                }
            }

            workbook.write(out);
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_EXCEL_TEMPLATE_OUTPUT_FAILED, e);
            throw new RuntimeException(BackendMessageCatalog.EX_EXCEL_TEMPLATE_OUTPUT_FAILED, e);
        }
    }

    private int findFirstEmptyRow(Sheet sheet, int defaultStartRow) {
        for (int i = defaultStartRow; i < sheet.getLastRowNum() + 50; i++) {
            Row row = sheet.getRow(i);
            if (row == null || row.getPhysicalNumberOfCells() == 0) {
                return i;
            }
        }
        return sheet.getLastRowNum() + 1;
    }

    private List<CellStyle> extractColumnStyles(Row styleRow, int columnCount, Workbook workbook) {
        List<CellStyle> styles = new ArrayList<>();
        for (int i = 0; i < columnCount; i++) {
            Cell cell = styleRow != null ? styleRow.getCell(i) : null;
            styles.add(cell != null ? cell.getCellStyle() : workbook.createCellStyle());
        }
        return styles;
    }

    private CellStyle mergeStyleWithDataType(CellStyle baseStyle, ReportDataType dataType, Workbook wb,
            String formatPattern) {
        CellStyle newStyle = wb.createCellStyle();
        newStyle.cloneStyleFrom(baseStyle);

        short dataFormat = 0;

        if (formatPattern != null && !formatPattern.isBlank()) {
            // カスタム書式がある場合
            dataFormat = wb.createDataFormat().getFormat(formatPattern);
        } else {
            // カスタムがない場合、型ごとに標準書式を適用
            switch (dataType) {
                case DATE:
                    dataFormat = 14; // yyyy/MM/dd
                    break;
                case CURRENCY:
                    dataFormat = wb.createDataFormat().getFormat(dataType.getDefaultFormat());
                    break;
                case STRING:
                    dataFormat = wb.createDataFormat().getFormat(dataType.getDefaultFormat());
                    break;
                case CUSTOM:
                case NUMBER:
                default:
                    dataFormat = 0; // General
                    break;
            }
        }
        newStyle.setDataFormat(dataFormat);

        return newStyle;
    }

    private int parseInteger(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        } else {
            return new BigDecimal(value.toString()).intValue();
        }
    }

    private double parseNumber(Object value) {
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        } else {
            return new BigDecimal(value.toString()).doubleValue(); // 精度あり
        }
    }

    public Date parseDate(Object value) {
        if (value instanceof Date) {
            return (Date) value;
        } else if (value instanceof LocalDate) {
            return Date.from(((LocalDate) value).atStartOfDay(ZoneId.systemDefault()).toInstant());
        } else if (value instanceof String) {
            String str = value.toString().trim();
            List<String> patterns = List.of("yyyy-MM-dd", "yyyy/MM/dd", "yyyyMMdd", "yyyy/MM");

            for (String pattern : patterns) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat(pattern);
                    sdf.setLenient(false);
                    Date parsed = sdf.parse(str);

                    // yyyy/MM の場合、強制的に「1日」として補完されることを確認
                    if ("yyyy/MM".equals(pattern)) {
                        Calendar cal = Calendar.getInstance();
                        cal.setTime(parsed);
                        cal.set(Calendar.DAY_OF_MONTH, 1);
                        return cal.getTime();
                    }

                    return parsed;
                } catch (Exception ignored) {
                }
            }

            throw new IllegalArgumentException(BackendMessageCatalog.format(
                    BackendMessageCatalog.EX_INVALID_DATE_FORMAT, value));
        } else {
            throw new IllegalArgumentException(BackendMessageCatalog.format(
                    BackendMessageCatalog.EX_INVALID_DATE_FORMAT, value));
        }
    }

    private boolean parseBoolean(Object value) {
        if (value instanceof Boolean)
            return (Boolean) value;
        return Boolean.parseBoolean(value.toString());
    }

}
