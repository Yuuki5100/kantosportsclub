package com.example.appserver.runner;

import com.example.appserver.config.AsyncJobProperties;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.AsyncJobStatusService;
import java.time.LocalDateTime;
import java.util.Locale;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

class ReportTypeJudgeTest {

    @Mock
    private ReportPollingRunner reportPollingRunner;
    @Mock
    private BackendMessageResolver messageResolver;
    @Mock
    private AsyncJobStatusService asyncJobStatusService;

    private AsyncJobProperties asyncJobProperties;

    private ReportTypeJudge reportTypeJudge;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        asyncJobProperties = new AsyncJobProperties();
        asyncJobProperties.setStatusTtlMinutes(5L);
        reportTypeJudge = new ReportTypeJudge(
                reportPollingRunner,
                messageResolver,
                asyncJobStatusService,
                asyncJobProperties);
    }

    @Test
    void judge_WithExcelUrl_ShouldReturnOkAndRun() {
        Long reportId = 123L;
        String exportTarget = "excelUrl";

        ResponseEntity<ApiResponse<String>> response = reportTypeJudge.judge(reportId, exportTarget, Locale.JAPAN);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        // jobName は UUID が付くので null でないことだけ確認
        assertNotNull(response.getBody().getData());
        assertTrue(response.getBody().getData().startsWith(exportTarget + "-"));
        // メッセージは null であること
        assertEquals(null, response.getBody().getMessage());

        verify(reportPollingRunner).run(eq(reportId), eq(response.getBody().getData()));
        verify(asyncJobStatusService).registerPending(
                eq(response.getBody().getData()),
                eq("REPORT_EXCEL_URL"),
                any(LocalDateTime.class));
        verifyNoMoreInteractions(reportPollingRunner);
    }

    @Test
    void judge_WhenReportIdIsNull_ShouldReturnBadRequest() {
        when(messageResolver.resolveError(eq(BackendMessageCatalog.CODE_E4003), any(Locale.class)))
                .thenReturn("必要なパラメータが不足しています");

        String exportTarget = "excelUrl";
        ResponseEntity<ApiResponse<String>> response = reportTypeJudge.judge(null, exportTarget, Locale.JAPAN);

        assertEquals(400, response.getStatusCode().value());
        assertEquals(BackendMessageCatalog.CODE_E4003, response.getBody().getErrorCode());
        assertEquals("必要なパラメータが不足しています", response.getBody().getMessage());
        verifyNoInteractions(reportPollingRunner, asyncJobStatusService);
    }

    @Test
    void judge_WhenExportTargetIsNull_ShouldReturnBadRequest() {
        when(messageResolver.resolveError(eq(BackendMessageCatalog.CODE_E4003), any(Locale.class)))
                .thenReturn("必要なパラメータが不足しています");

        Long reportId = 123L;
        ResponseEntity<ApiResponse<String>> response = reportTypeJudge.judge(reportId, null, Locale.JAPAN);

        assertEquals(400, response.getStatusCode().value());
        assertEquals(BackendMessageCatalog.CODE_E4003, response.getBody().getErrorCode());
        assertEquals("必要なパラメータが不足しています", response.getBody().getMessage());
        verifyNoInteractions(reportPollingRunner, asyncJobStatusService);
    }

    @Test
    void judge_WhenExportTargetIsInvalid_ShouldReturnBadRequest() {
        when(messageResolver.resolveError(eq(BackendMessageCatalog.CODE_E4002), any(Locale.class)))
                .thenReturn("無効なファイル種別です");

        Long reportId = 123L;
        String exportTarget = "EXPORT";
        ResponseEntity<ApiResponse<String>> response = reportTypeJudge.judge(reportId, exportTarget, Locale.JAPAN);
        assertEquals(400, response.getStatusCode().value());
        assertEquals(BackendMessageCatalog.CODE_E4002, response.getBody().getErrorCode());
        assertEquals("無効なファイル種別です", response.getBody().getMessage());
        verifyNoInteractions(reportPollingRunner, asyncJobStatusService);
    }
}
