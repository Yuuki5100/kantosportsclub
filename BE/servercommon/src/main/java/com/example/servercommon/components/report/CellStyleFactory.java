package com.example.servercommon.components.report;

import org.apache.poi.ss.usermodel.*;

import java.util.HashMap;
import java.util.Map;

import com.example.servercommon.enums.ReportDataType;

public class CellStyleFactory {

    private final Workbook workbook;
    private final Map<ReportDataType, CellStyle> styleCache = new HashMap<>();

    public CellStyleFactory(Workbook workbook) {
        this.workbook = workbook;
    }

    public CellStyle getStyleFor(ReportDataType dataType, String formatPattern) {
        return styleCache.computeIfAbsent(dataType, dt -> {
            CellStyle style = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();

            switch (dt) {
                case NUMBER:
                    style.setDataFormat(format.getFormat(formatPattern != null ? formatPattern : "#,##0.###"));
                    break;
                case DATE:
                    style.setDataFormat(format.getFormat(formatPattern != null ? formatPattern : "yyyy/mm/dd"));
                    break;
                case CURRENCY:
                    style.setDataFormat(format.getFormat(formatPattern != null ? formatPattern : "¥#,##0"));
                    break;
                case BOOLEAN:
                    // 表示自体は true/false の文字列とする想定（書式ではなく値に依存）
                    break;
                case STRING:
                case CUSTOM:
                    if (formatPattern != null && !formatPattern.isBlank()) {
                        style.setDataFormat(format.getFormat(formatPattern));
                    } else {
                        style.setDataFormat(format.getFormat("@")); // fallback
                    }
                    break;

                default:
                    style.setDataFormat(format.getFormat("text"));
                    break;
            }

            // ここでフォント・枠線等のスタイル共通設定も必要なら付与
            Font font = workbook.createFont();
            font.setFontName("Meiryo");
            style.setFont(font);

            return style;
        });
    }
}
