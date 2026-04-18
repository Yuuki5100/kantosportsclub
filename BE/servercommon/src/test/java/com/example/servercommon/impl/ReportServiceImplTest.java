package com.example.servercommon.impl;

import com.example.servercommon.components.report.ExcelGenerator;
import com.example.servercommon.components.report.PdfGenerator;
import com.example.servercommon.exception.ReportGenerationException;
import com.example.servercommon.file.FileSaver;
import com.example.servercommon.helper.ReportDefinitionLoader;
import com.example.servercommon.mapper.ReportTemplateMapper;
import com.example.servercommon.model.ReportDefinition;
import com.example.servercommon.model.ReportLayout;
import com.example.servercommon.model.ReportMaster;
import com.example.servercommon.repository.ReportLayoutRepository;
import com.example.servercommon.repository.ReportMasterRepository;
import com.example.servercommon.service.ReportService;
import com.example.servercommon.service.StorageService;
import com.example.servercommon.service.reports.FetchReportDataService;
import com.example.servercommon.service.reports.ReportEntityFetcher;
import com.example.servercommon.validationtemplate.reader.GenericEntityReader;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class ReportServiceImplEntityModeTest {

    private ReportDefinitionLoader reportDefinitionLoader;
    private StorageService storageService;
    private ExcelGenerator excelGenerator;
    private PdfGenerator pdfGenerator;
    private FileSaver fileSaver;
    private FetchReportDataService fetchReportDataService;
    private ReportMasterRepository reportMasterRepository;
    private ReportLayoutRepository reportLayoutRepository;
    private ReportEntityFetcher fetcher;

    private ReportService reportService;

    private GenericEntityReader genericEntityReader;
    private ApplicationContext applicationContext;
    private ReportTemplateMapper reportTemplateMapper;

    @BeforeEach
    void setUp() {
        reportDefinitionLoader = mock(ReportDefinitionLoader.class);
        storageService = mock(StorageService.class);
        excelGenerator = mock(ExcelGenerator.class);
        pdfGenerator = mock(PdfGenerator.class);
        fileSaver = mock(FileSaver.class);
        fetchReportDataService = mock(FetchReportDataService.class);
        reportMasterRepository = mock(ReportMasterRepository.class);
        reportLayoutRepository = mock(ReportLayoutRepository.class);
        fetcher = mock(ReportEntityFetcher.class);
        reportTemplateMapper = mock(ReportTemplateMapper.class); // ✅
        genericEntityReader = mock(GenericEntityReader.class);   // ✅
        applicationContext = mock(ApplicationContext.class);     // ✅

        reportService = new ReportServiceImpl(
                reportDefinitionLoader,
                storageService,
                excelGenerator,
                pdfGenerator,
                fileSaver,
                fetchReportDataService,
                reportMasterRepository,
                reportLayoutRepository,
                List.of(fetcher),
                genericEntityReader,               // ✅ 新規
                applicationContext,               // ✅ 新規
                reportTemplateMapper              // ✅ 新規
        );
    }

    static class DummyOrder {
        public String productName = "Test Product";
        public int quantity = 2;
    }

    @SuppressWarnings("unchecked")
    @Test
    void generateReportPDFBase64_shouldThrow_whenPdfGenerationFails() {
        Long reportId = 1001L;

        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("productName");
        layout.setDisplayLabel("商品名");

        List<ReportLayout> layoutList = List.of(layout);
        ReportMaster master = new ReportMaster();
        master.setTemplateFile("template.rrpt");
        ReportDefinition def = new ReportDefinition(master, layoutList);

        File dummyTemplate = mock(File.class);
        when(dummyTemplate.exists()).thenReturn(true);

        when(reportDefinitionLoader.load(reportId)).thenReturn(def);
        when(storageService.getFileByPath("template.rrpt")).thenReturn(dummyTemplate);

        when(fetcher.supports(reportId)).thenReturn(true);

        // モック戻り値のキャストを抑制
        List<DummyOrder> dummyEntities = List.of(new DummyOrder());
        when(fetcher.fetchEntities(reportId)).thenReturn((List) dummyEntities);

        when(fetchReportDataService.fetchReportData(anyList(), eq(layoutList)))
                .thenThrow(new RuntimeException("PDF生成失敗"));

        assertThatThrownBy(() -> reportService.generateReportPDFBase64(reportId))
                .isInstanceOf(ReportGenerationException.class)
                .hasMessageContaining("PDF帳票生成中にエラー");
    }
}
