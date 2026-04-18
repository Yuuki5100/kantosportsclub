package com.example.servercommon.components.report;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.ReportLayout;
import com.example.servercommon.utils.ReadPDF;
import jp.co.systembase.report.Report;
import jp.co.systembase.report.ReportPages;
import jp.co.systembase.report.data.ReportDataSource;
import jp.co.systembase.report.renderer.pdf.PdfRenderer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.MockedStatic;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PdfGeneratorTest {

    private ReportFactory mockReportFactory;
    private PdfRendererFactory pdfRendererFactory;
    private PdfGenerator pdfGenerator;

    @BeforeEach
    void setUp() {
        mockReportFactory = mock(ReportFactory.class);
        pdfRendererFactory = mock(PdfRendererFactory.class);
        pdfGenerator = new PdfGenerator(mockReportFactory, pdfRendererFactory);
    }

    @Test
    void testFillTemplate_success(@TempDir File tempDir) throws Exception {
        // Arrange
        File mockTemplate = new File(tempDir, "template.json");
        mockTemplate.createNewFile();

        List<Map<String, Object>> fillData = new ArrayList<>();
        Map<String, Object> row = new HashMap<>();
        row.put("name", "テストユーザー");
        fillData.add(row);

        List<ReportLayout> dummyLayout = List.of(); // 未使用

        Map<String, Object> dummyTemplate = Map.of("template", "dummy");

        try (MockedStatic<ReadPDF> mockedReadPdf = mockStatic(ReadPDF.class)) {
            mockedReadPdf.when(() -> ReadPDF.readJson(mockTemplate.getAbsolutePath()))
                         .thenReturn(dummyTemplate);

            // モックのReportとReportPagesを準備
            Report mockReport = mock(Report.class);
            ReportPages mockPages = mock(ReportPages.class);

            // factoryにテンプレートを渡したときの戻り値を定義
            when(mockReportFactory.create(dummyTemplate)).thenReturn(mockReport);
            when(mockReport.getPages()).thenReturn(mockPages);

            // レンダリング時の副作用を抑止
            doNothing().when(mockPages).render(any(PdfRenderer.class));
            doNothing().when(mockReport).fill(any(ReportDataSource.class));

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            when(pdfRendererFactory.create(any())).thenReturn(mock(PdfRenderer.class));

            // Act & Assert
            assertDoesNotThrow(() ->
                pdfGenerator.fillTemplate(mockTemplate, dummyLayout, fillData, out)
            );
        }
    }
    @Test
    void testFillTemplate_templateReadFails_throwsRuntimeException(@TempDir File tempDir) throws Exception {
        File mockTemplate = new File(tempDir, "bad-template.json");
        mockTemplate.createNewFile();

    try (MockedStatic<ReadPDF> mockedReadPdf = mockStatic(ReadPDF.class)) {
        mockedReadPdf.when(() -> ReadPDF.readJson(mockTemplate.getAbsolutePath()))
                     .thenThrow(new IllegalArgumentException("テンプレート読み込み失敗"));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            pdfGenerator.fillTemplate(mockTemplate, List.of(), List.of(), new ByteArrayOutputStream())
        );
        assertTrue(ex.getMessage().contains(BackendMessageCatalog.PDF_GENERATION_FAILED));
    }
}

@Test
void testFillTemplate_reportFactoryFails_throwsRuntimeException(@TempDir File tempDir) throws Exception {
    // Arrange
    File mockTemplate = new File(tempDir, "template.json");
    mockTemplate.createNewFile();

    Map<String, Object> dummyTemplate = Map.of("template", "dummy");

    try (MockedStatic<ReadPDF> mockedReadPdf = mockStatic(ReadPDF.class)) {
        mockedReadPdf.when(() -> ReadPDF.readJson(mockTemplate.getAbsolutePath()))
                     .thenReturn(dummyTemplate);

        when(mockReportFactory.create(dummyTemplate))
            .thenThrow(new RuntimeException("Report生成失敗"));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            pdfGenerator.fillTemplate(mockTemplate, List.of(), List.of(), new ByteArrayOutputStream())
        );
        assertTrue(ex.getCause().getMessage().contains("Report生成失敗"));
    }
}

@Test
void testFillTemplate_renderFails_throwsRuntimeException(@TempDir File tempDir) throws Exception {
    // Arrange
    File mockTemplate = new File(tempDir, "template.json");
    mockTemplate.createNewFile();

    Map<String, Object> dummyTemplate = Map.of("template", "dummy");

    try (MockedStatic<ReadPDF> mockedReadPdf = mockStatic(ReadPDF.class)) {
        mockedReadPdf.when(() -> ReadPDF.readJson(mockTemplate.getAbsolutePath()))
                     .thenReturn(dummyTemplate);

        Report mockReport = mock(Report.class);
        ReportPages mockPages = mock(ReportPages.class);

        when(mockReportFactory.create(dummyTemplate)).thenReturn(mockReport);
        when(mockReport.getPages()).thenReturn(mockPages);
        doNothing().when(mockReport).fill(any(ReportDataSource.class));
        doThrow(new RuntimeException("PDF生成中に失敗")).when(mockPages).render(any(PdfRenderer.class));
        when(pdfRendererFactory.create(any())).thenReturn(mock(PdfRenderer.class));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            pdfGenerator.fillTemplate(mockTemplate, List.of(), List.of(), new ByteArrayOutputStream())
        );
        assertTrue(ex.getCause().getMessage().contains("PDF生成中に失敗"));
    }
}
}
