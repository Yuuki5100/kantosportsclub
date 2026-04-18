package com.example.servercommon.components.report;

import com.example.servercommon.enums.ReportDataType;
import com.example.servercommon.model.ReportLayout;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExcelGenerator {

    private final ExcelTemplateFiller excelTemplateFiller;

    private double truncateTo3DecimalPlaces(Object value) {
        try {
            BigDecimal bd = new BigDecimal(value.toString());
            return bd.setScale(3, RoundingMode.DOWN).doubleValue(); // 小数点第4位以下切り捨て
        } catch (NumberFormatException e) {
            return Double.NaN; // または 0.0 や例外スローでも可
        }
    }

    /**
     * テンプレートファイルにレイアウト・データを差し込み出力（通常使用）
     */
    public void fillTemplate(File template, List<ReportLayout> layout, List<Map<String, Object>> data,
            OutputStream out) {
        excelTemplateFiller.fill(template, layout, data, out);
    }

    /**
     * テンプレートファイルにレイアウトだけ差し込み（データなし）。テストや初期出力用
     */
    public void fillTemplate(File template, List<ReportLayout> layout, OutputStream out) {
        fillTemplate(template, layout, List.of(), out);
    }

    /**
     * 簡易ヘッダー＋データ出力（テンプレート未使用） - 動的Excel出力向け
     */
    public void fillSheet(List<ReportLayout> layout, List<Map<String, Object>> data, Sheet sheet) {
        Workbook workbook = sheet.getWorkbook();

        // ヘッダー書式
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        // データ型に応じたスタイル生成ユーティリティ
        CellStyleFactory styleFactory = new CellStyleFactory(workbook);

        // ヘッダー行
        Row header = sheet.createRow(0);
        for (int i = 0; i < layout.size(); i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(layout.get(i).getDisplayLabel());
            cell.setCellStyle(headerStyle);
        }

        // データ行
        for (int rowIndex = 0; rowIndex < data.size(); rowIndex++) {
            Map<String, Object> rowData = data.get(rowIndex);
            Row row = sheet.createRow(rowIndex + 1);

            for (int colIndex = 0; colIndex < layout.size(); colIndex++) {
                ReportLayout colDef = layout.get(colIndex);
                Object value = rowData.get(colDef.getPropertyPath());

                ReportDataType dataType = ReportDataType.fromCode(colDef.getDataType());
                Cell cell = row.createCell(colIndex);

                if (value == null) {
                    // null時の処理
                    switch (dataType) {
                        case NUMBER, CURRENCY -> cell.setCellValue(0.0);
                        case BOOLEAN -> cell.setCellValue(false);
                        case DATE -> cell.setBlank();
                        default -> cell.setCellValue("");
                    }
                } else {
                    try {
                        if (dataType == ReportDataType.NUMBER || dataType == ReportDataType.CURRENCY) {
                            double num = (value instanceof Number)
                                    ? ((Number) value).doubleValue()
                                    : new BigDecimal(value.toString()).doubleValue();

                            if (dataType == ReportDataType.NUMBER) {
                                num = truncateTo3DecimalPlaces(num);
                            }

                            cell.setCellValue(num);

                        } else if (dataType == ReportDataType.DATE) {
                            Date date = convertToDate(value);
                            if (date != null) {
                                cell.setCellValue(date);
                            } else {
                                cell.setCellValue(value.toString());
                            }

                        } else if (dataType == ReportDataType.BOOLEAN) {
                            cell.setCellValue(Boolean.parseBoolean(value.toString()));

                        } else {
                            cell.setCellValue(value.toString());
                        }

                    } catch (Exception e) {
                        cell.setCellValue(value.toString());
                    }
                }

                // 書式の適用（nullでも）
                CellStyle style = styleFactory.getStyleFor(dataType, colDef.getFormatPattern());
                if (style != null) {
                    cell.setCellStyle(style);
                }
            }
        }

    }

    /**
     * 任意のオブジェクトから java.util.Date への変換を試みる
     */
    private Date convertToDate(Object value) {
        if (value instanceof Date d) {
            return d;
        } else if (value instanceof LocalDate ld) {
            return Date.from(ld.atStartOfDay(ZoneId.systemDefault()).toInstant());
        } else if (value instanceof LocalDateTime ldt) {
            return Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
        } else if (value instanceof String str) {
            str = str.trim();
            List<String> patterns = List.of("yyyy-MM-dd", "yyyy/MM/dd", "yyyyMMdd", "yyyy/MM");

            for (String pattern : patterns) {
                try {
                    java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat(pattern);
                    sdf.setLenient(false);
                    Date parsed = sdf.parse(str);

                    if ("yyyy/MM".equals(pattern)) {
                        // yyyy/MM の場合は 1日補完
                        java.util.Calendar cal = java.util.Calendar.getInstance();
                        cal.setTime(parsed);
                        cal.set(java.util.Calendar.DAY_OF_MONTH, 1);
                        return cal.getTime();
                    }

                    return parsed;
                } catch (Exception ignored) {
                    // 無視して次のパターンを試す
                }
            }
        }
        return null; // いずれにも該当しない
    }

}
