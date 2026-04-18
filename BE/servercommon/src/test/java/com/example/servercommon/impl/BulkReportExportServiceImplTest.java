package com.example.servercommon.impl;

import com.example.servercommon.components.report.ExcelGenerator;
import com.example.servercommon.components.report.PdfGenerator;
import com.example.servercommon.file.FileSaver;
import com.example.servercommon.helper.ReportDefinitionLoader;
import com.example.servercommon.model.ReportDefinition;
import com.example.servercommon.model.ReportLayout;
import com.example.servercommon.model.ReportMaster;
import com.example.servercommon.request.report.BulkExportRequest;
import com.example.servercommon.service.StorageService;
import com.example.servercommon.service.reports.FetchReportDataService;
import com.example.servercommon.service.reports.ReportEntityFetcher;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.net.URL;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class BulkReportExportServiceImplTest {

    private ReportDefinitionLoader reportDefinitionLoader;
    private FetchReportDataService fetchReportDataService;
    private PdfGenerator pdfGenerator;
    private ExcelGenerator excelGenerator;
    private FileSaver fileSaver;
    private StorageService storageService;

    @SuppressWarnings("unchecked")
    private ReportEntityFetcher fetcher; // ジェネリクス削除

    private BulkReportExportServiceImpl service;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() throws Exception {
        reportDefinitionLoader = mock(ReportDefinitionLoader.class);
        fetchReportDataService = mock(FetchReportDataService.class);
        pdfGenerator = mock(PdfGenerator.class);
        excelGenerator = mock(ExcelGenerator.class);
        fileSaver = mock(FileSaver.class);
        storageService = mock(StorageService.class);

        fetcher = mock(ReportEntityFetcher.class); // ← フィールドに代入する

        service = new BulkReportExportServiceImpl(
                reportDefinitionLoader,
                fetchReportDataService,
                pdfGenerator,
                excelGenerator,
                fileSaver,
                storageService,
                List.of(fetcher) // 注入
        );
    }

    @Test
    @SuppressWarnings("unchecked")
    void Excel一括出力が正常に完了し_署名付きURLが返却される() throws Exception {
        Long reportId = 1L;
        File templateFile = createValidExcelTemplate("template.xlsx");

        ReportMaster master = new ReportMaster();
        master.setReportId(reportId);
        master.setReportName("ExcelReport");
        master.setTemplateFile(templateFile.getName());

        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("name");
        layout.setDisplayLabel("名前");

        List<ReportLayout> layoutList = List.of(layout);
        List<DummyEntity> entities = List.of(new DummyEntity("テスト"));
        List<Map<String, Object>> data = List.of(Map.of("名前", "テスト"));
        List<Object> objectEntities = new ArrayList<>(entities);  // DummyEntity → Object



        ReportDefinition def = new ReportDefinition(master, layoutList);

        when(reportDefinitionLoader.load(reportId)).thenReturn(def);
        when(storageService.getFileByPath(templateFile.getName())).thenReturn(templateFile);
        when(fetcher.supports(reportId)).thenReturn(true);

        when(fetcher.fetchEntities(reportId)).thenAnswer(invocation -> objectEntities);


        when(fetchReportDataService.fetchReportData(objectEntities, layoutList)).thenReturn(data);

doAnswer(invocation -> {
    OutputStream os = invocation.getArgument(3);
    try (XSSFWorkbook wb = new XSSFWorkbook()) {
        Sheet sheet = wb.createSheet("Sheet1");
        Row row = sheet.createRow(0);
        row.createCell(0).setCellValue("名前");
        wb.write(os);
    }
    return null;
}).when(excelGenerator).fillTemplate(eq(templateFile), eq(layoutList), eq(data), any(OutputStream.class));


        URL mockUrl = new URL("https://example.com/result.xlsx");
        when(storageService.generatePresignedUrl(any())).thenReturn(mockUrl);

        BulkExportRequest request = new BulkExportRequest();
        request.setOutputFormat("excel");
        request.setReportIds(List.of(reportId));

        String result = service.exportBulk(request);

        assertThat(result).isEqualTo(mockUrl.toString());
    }

    @Test
    void 不正な出力形式が指定された場合_例外が発生する() {
        BulkExportRequest request = new BulkExportRequest();
        request.setOutputFormat("xml");
        request.setReportIds(List.of(1L));

        Throwable thrown = catchThrowable(() -> service.exportBulk(request));

        assertThat(thrown)
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("一括帳票出力に失敗しました")
                .hasCauseInstanceOf(IllegalArgumentException.class);
    }

    // ===== テスト用ヘルパーとダミーエンティティ =====

    private File createValidExcelTemplate(String fileName) throws Exception {
        File file = tempDir.resolve(fileName).toFile();
        try (XSSFWorkbook wb = new XSSFWorkbook(); FileOutputStream fos = new FileOutputStream(file)) {
            Sheet sheet = wb.createSheet("Sheet1");
            Row row = sheet.createRow(0);
            row.createCell(0).setCellValue("header");
            wb.write(fos);
        }
        return file;
    }

    static class DummyEntity {
        public String name;

        public DummyEntity(String name) {
            this.name = name;
        }
    }
}
