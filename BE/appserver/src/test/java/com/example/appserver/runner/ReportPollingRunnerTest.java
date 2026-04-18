package com.example.appserver.runner;

import com.example.appserver.config.AsyncJobProperties;
import com.example.appserver.service.NotifyQueuePublisherImpl;
import com.example.servercommon.enums.NotifyEventType;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.service.AsyncJobArtifactService;
import com.example.servercommon.service.AsyncJobStatusService;
import com.example.servercommon.service.ReportService;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReportPollingRunnerTest {

    private ReportService reportService;
    private NotifyQueuePublisherImpl notifyQueuePublisher;
    private JobStatusRepository jobStatusRepository;
    private AsyncJobStatusService asyncJobStatusService;
    private AsyncJobArtifactService asyncJobArtifactService;
    private AsyncJobProperties asyncJobProperties;
    private ReportPollingRunner runner;

    @BeforeEach
    void setUp() {
        reportService = mock(ReportService.class);
        notifyQueuePublisher = mock(NotifyQueuePublisherImpl.class);
        jobStatusRepository = mock(JobStatusRepository.class);
        asyncJobStatusService = mock(AsyncJobStatusService.class);
        asyncJobArtifactService = mock(AsyncJobArtifactService.class);
        asyncJobProperties = new AsyncJobProperties();
        asyncJobProperties.setStatusTtlMinutes(30L);
        asyncJobProperties.setArtifactPrefix("async-jobs");

        when(jobStatusRepository.findByJobName(anyString())).thenReturn(Optional.empty());
        when(jobStatusRepository.save(any(JobStatus.class))).thenAnswer(invocation -> invocation.getArgument(0));

        runner = new ReportPollingRunner(
                reportService,
                notifyQueuePublisher,
                jobStatusRepository,
                asyncJobStatusService,
                asyncJobArtifactService,
                asyncJobProperties);
    }

    @Test
    void run_正常系_shouldMarkCompletedWithArtifactPath() {
        String jobName = "excelUrl-job1";
        when(reportService.generateReportDownloadUrl(1L, jobName)).thenReturn("http://example.com/test.xlsx");

        runner.run(1L, jobName);

        verify(asyncJobStatusService).markRunning(eq(jobName), eq("REPORT_EXCEL_URL"), any(LocalDateTime.class));
        verify(asyncJobStatusService).markCompleted(
                eq(jobName),
                eq("excel/" + jobName + ".xlsx"),
                eq("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
                any(LocalDateTime.class));
        verify(notifyQueuePublisher).publish(NotifyEventType.FILE_DOWNLOAD_COMPLETED, 1L);
    }

    @Test
    void run_異常系_shouldMarkFailed() {
        String jobName = "excelUrl-fail";
        String artifactPath = "excel/" + jobName + ".xlsx";
        when(reportService.generateReportDownloadUrl(anyLong(), eq(jobName)))
                .thenThrow(new RuntimeException("帳票生成失敗"));

        runner.run(3L, jobName);

        verify(asyncJobStatusService).markRunning(eq(jobName), eq("REPORT_EXCEL_URL"), any(LocalDateTime.class));
        verify(asyncJobArtifactService).deleteQuietly(eq(artifactPath));
        verify(asyncJobStatusService).markFailed(eq(jobName), eq("帳票生成失敗"), any(LocalDateTime.class));
        verify(asyncJobStatusService, never()).markCompleted(anyString(), anyString(), anyString(), any(LocalDateTime.class));
    }

    @Test
    void runFileOutput_正常系_shouldPersistArtifactAndComplete() throws Exception {
        String jobName = "pdf-job2";
        String artifactPath = "async-jobs/" + jobName + ".pdf";
        InputStream stream = new ByteArrayInputStream("dummy".getBytes());
        when(reportService.generateReportPDF(9L, "sample", "pdf")).thenReturn(stream);

        runner.runFileOutput(9L, "sample", "pdf", jobName);

        verify(asyncJobStatusService).markRunning(eq(jobName), eq("REPORT_FILE_PDF"), any(LocalDateTime.class));
        verify(asyncJobArtifactService).save(eq(artifactPath), any(InputStream.class));
        verify(asyncJobStatusService).markCompleted(eq(jobName), eq(artifactPath), eq("application/pdf"), any(LocalDateTime.class));
    }

    @Test
    void runFileOutput_異常系_shouldDeleteArtifactAndFail() {
        String jobName = "pdf-job-fail";
        String artifactPath = "async-jobs/" + jobName + ".pdf";
        when(reportService.generateReportPDF(10L, "sample", "pdf"))
                .thenThrow(new RuntimeException("帳票生成失敗"));

        runner.runFileOutput(10L, "sample", "pdf", jobName);

        verify(asyncJobStatusService).markRunning(eq(jobName), eq("REPORT_FILE_PDF"), any(LocalDateTime.class));
        verify(asyncJobArtifactService).deleteQuietly(eq(artifactPath));
        verify(asyncJobStatusService).markFailed(eq(jobName), eq("帳票生成失敗"), any(LocalDateTime.class));
    }
}
