package com.example.servercommon.aspect;

import com.example.servercommon.components.report.CellStyleFactory;
import com.example.servercommon.enums.ReportDataType;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CellStyleFactoryTest {

    private Workbook workbook;
    private CellStyleFactory factory;

    @BeforeEach
    void setUp() {
        workbook = new XSSFWorkbook();
        factory = new CellStyleFactory(workbook);
    }

    @Test
    void numberStyleHasCorrectFormat() {
        CellStyle style = factory.getStyleFor(ReportDataType.NUMBER, null);
        DataFormat format = workbook.createDataFormat();
        assertThat(style.getDataFormat()).isEqualTo(format.getFormat("#,##0.###"));
    }

    @Test
    void dateStyleHasCorrectFormat() {
        CellStyle style = factory.getStyleFor(ReportDataType.DATE, null);
        DataFormat format = workbook.createDataFormat();
        assertThat(style.getDataFormat()).isEqualTo(format.getFormat("yyyy/mm/dd"));
    }

    @Test
    void currencyStyleHasCorrectFormat() {
        CellStyle style = factory.getStyleFor(ReportDataType.CURRENCY, null);
        DataFormat format = workbook.createDataFormat();
        assertThat(style.getDataFormat()).isEqualTo(format.getFormat("¥#,##0"));
    }

    @Test
    void booleanStyleHasDefaultFormat() {
        CellStyle style = factory.getStyleFor(ReportDataType.BOOLEAN, null);
        // Boolean はデフォルトで書式なし（0 か 1）
        assertThat(style).isNotNull();
    }

    @Test
    void stringStyleUsesCustomFormatIfProvided() {
        String customPattern = "@@@";
        CellStyle style = factory.getStyleFor(ReportDataType.STRING, customPattern);
        DataFormat format = workbook.createDataFormat();
        assertThat(style.getDataFormat()).isEqualTo(format.getFormat(customPattern));
    }

    @Test
    void customTypeUsesCustomFormatIfProvided() {
        String customPattern = "##0.00%";
        CellStyle style = factory.getStyleFor(ReportDataType.CUSTOM, customPattern);
        DataFormat format = workbook.createDataFormat();
        assertThat(style.getDataFormat()).isEqualTo(format.getFormat(customPattern));
    }

    @Test
    void stylesAreCached() {
        CellStyle first = factory.getStyleFor(ReportDataType.NUMBER, null);
        CellStyle second = factory.getStyleFor(ReportDataType.NUMBER, null);
        assertThat(first).isSameAs(second); // キャッシュされて同一インスタンス
    }

    @Test
    void fontIsSetToMeiryo() {
        CellStyle style = factory.getStyleFor(ReportDataType.STRING, null);

        short fontIndex = (short) style.getFontIndex();
        assertThat(workbook.getFontAt(fontIndex).getFontName()).isEqualTo("Meiryo");
    }
}
