package com.example.servercommon.service;

import com.example.servercommon.components.report.ExcelGenerator;
import com.example.servercommon.components.report.PdfGenerator;
import com.example.servercommon.file.FileSaver;
import com.example.servercommon.helper.ReportDefinitionLoader;
import com.example.servercommon.impl.ReportServiceImpl;
import com.example.servercommon.mapper.ReportTemplateMapper;
import com.example.servercommon.model.ReportDefinition;
import com.example.servercommon.model.ReportLayout;
import com.example.servercommon.model.ReportMaster;
import com.example.servercommon.repository.ReportLayoutRepository;
import com.example.servercommon.repository.ReportMasterRepository;
import com.example.servercommon.service.reports.FetchReportDataService;
import com.example.servercommon.validationtemplate.reader.GenericEntityReader;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.net.URL;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ReportServiceTest {

    private ReportServiceImpl reportService;

    private ReportMasterRepository reportMasterRepository;
    private ReportLayoutRepository reportLayoutRepository;
    private StorageService storageService;
    private ExcelGenerator excelGenerator;
    private PdfGenerator pdfGenerator;
    private FileSaver fileSaver;
    private FetchReportDataService fetchReportDataService;
    private ReportDefinitionLoader reportDefinitionLoader;

    private GenericEntityReader genericEntityReader;
    private ApplicationContext applicationContext;
    private ReportTemplateMapper reportTemplateMapper;

    static class DummyFetcher implements com.example.servercommon.service.reports.ReportEntityFetcher {
        @Override
        public boolean supports(Long reportId) {
            return true; // すべてのIDに対応
        }

        @Override
        public List<Object> fetchEntities(Long reportId) {
            return List.of(new DummyEntity("テストユーザー"));
        }
    }

    static class DummyEntity {
        private final String name;

        public DummyEntity(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }
    }

    @BeforeEach
    void setUp() {
        reportDefinitionLoader = mock(ReportDefinitionLoader.class);
        reportMasterRepository = mock(ReportMasterRepository.class);
        reportLayoutRepository = mock(ReportLayoutRepository.class);
        storageService = mock(StorageService.class);
        excelGenerator = mock(ExcelGenerator.class);
        pdfGenerator = mock(PdfGenerator.class);
        fileSaver = mock(FileSaver.class);
        fetchReportDataService = mock(FetchReportDataService.class);
        reportTemplateMapper = mock(ReportTemplateMapper.class); // ✅ 追加
        genericEntityReader = mock(GenericEntityReader.class);   // ✅ 追加
        applicationContext = mock(ApplicationContext.class);     // ✅ 追加

        reportService = new ReportServiceImpl(
                reportDefinitionLoader,
                storageService,
                excelGenerator,
                pdfGenerator,
                fileSaver,
                fetchReportDataService,
                reportMasterRepository,
                reportLayoutRepository,
                List.of(new DummyFetcher()), // ReportEntityFetcher は空でも可
                genericEntityReader,               // ✅ 新規引数
                applicationContext,               // ✅ 新規引数
                reportTemplateMapper              // ✅ 新規引数
        );
    }

    @Test
    void PDF帳票がBase64で出力されること() throws Exception {
        Long reportId = 1L;

        ReportMaster mockMaster = new ReportMaster();
        mockMaster.setTemplateFile("template/sample.rrpt");

        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("name");
        layout.setDisplayLabel("名前");
        List<ReportLayout> layoutList = List.of(layout);

        ReportDefinition def = new ReportDefinition(mockMaster, layoutList);
        when(reportDefinitionLoader.load(reportId)).thenReturn(def);

        File dummyFile = File.createTempFile("sample", ".rrpt");
        when(storageService.getFileByPath("template/sample.rrpt")).thenReturn(dummyFile);

        List<Map<String, Object>> fillData = List.of(Map.of("名前", "テストユーザー"));
        when(fetchReportDataService.fetchReportData(anyList(), eq(layoutList))).thenReturn(fillData); // ← ここ重要

        doAnswer(invocation -> {
            ByteArrayOutputStream out = invocation.getArgument(3);
            out.write("dummyPDF".getBytes());
            return null;
        }).when(pdfGenerator).fillTemplate(eq(dummyFile), eq(layoutList), eq(fillData), any());

        String base64 = reportService.generateReportPDFBase64(reportId);
        assertThat(base64).isEqualTo(Base64.getEncoder().encodeToString("dummyPDF".getBytes()));
    }

    @Test
    void Excel帳票のダウンロードURLが返されること() throws Exception {
        Long reportId = 1L;
        String fileName = "test-report";

        ReportMaster mockMaster = new ReportMaster();
        mockMaster.setTemplateFile("template/sample.xlsx");

        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("name");
        layout.setDisplayLabel("名前");
        List<ReportLayout> layoutList = List.of(layout);

        ReportDefinition def = new ReportDefinition(mockMaster, layoutList);
        when(reportDefinitionLoader.load(reportId)).thenReturn(def);

        File dummyFile = File.createTempFile("sample", ".xlsx");
        when(storageService.getFileByPath("template/sample.xlsx")).thenReturn(dummyFile);

        doAnswer(invocation -> {
            ByteArrayOutputStream out = invocation.getArgument(2);
            out.write("dummyExcel".getBytes());
            return null;
        }).when(excelGenerator).fillTemplate(eq(dummyFile), eq(layoutList), any());

        doNothing().when(fileSaver).save(anyString(), any());
        when(storageService.generatePresignedUrl(anyString())).thenReturn(new URL("http://localhost/test.xlsx"));

        String resultUrl = reportService.generateReportDownloadUrl(reportId, fileName);
        assertThat(resultUrl).isEqualTo("http://localhost/test.xlsx");
    }
}
