package com.example.servercommon.service;

import com.example.servercommon.enums.AsyncJobExecutionStatus;
import com.example.servercommon.model.AsyncJobExecution;
import com.example.servercommon.repository.AsyncJobExecutionRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AsyncJobStatusServiceTest {

    @Mock
    private AsyncJobExecutionRepository repository;

    private AsyncJobStatusService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new AsyncJobStatusService(repository);
        when(repository.save(any(AsyncJobExecution.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void registerPending_未登録時_shouldCreatePending() {
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);
        when(repository.findByJobName("job-1")).thenReturn(Optional.empty());

        AsyncJobExecution result = service.registerPending("job-1", "REPORT_EXCEL_URL", expiresAt);

        assertEquals("job-1", result.getJobName());
        assertEquals("REPORT_EXCEL_URL", result.getJobType());
        assertEquals(AsyncJobExecutionStatus.PENDING, result.getStatus());
        assertEquals(expiresAt, result.getExpiresAt());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
    }

    @Test
    void markCompleted_shouldStoreArtifactInfo() {
        AsyncJobExecution execution = new AsyncJobExecution();
        execution.setJobName("job-2");
        execution.setStatus(AsyncJobExecutionStatus.RUNNING);
        when(repository.findByJobName("job-2")).thenReturn(Optional.of(execution));

        LocalDateTime endedAt = LocalDateTime.now();
        AsyncJobExecution result = service.markCompleted(
                "job-2",
                "excel/job-2.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                endedAt);

        assertEquals(AsyncJobExecutionStatus.COMPLETED, result.getStatus());
        assertEquals("excel/job-2.xlsx", result.getArtifactPath());
        assertEquals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", result.getArtifactMimeType());
        assertEquals(endedAt, result.getEndedAt());
        assertNull(result.getErrorMessage());
    }

    @Test
    void markFailed_shouldTruncateErrorMessage() {
        AsyncJobExecution execution = new AsyncJobExecution();
        execution.setJobName("job-3");
        execution.setStatus(AsyncJobExecutionStatus.RUNNING);
        execution.setArtifactPath("tmp/path.pdf");
        execution.setArtifactMimeType("application/pdf");
        when(repository.findByJobName("job-3")).thenReturn(Optional.of(execution));

        String longMessage = "x".repeat(1200);
        AsyncJobExecution result = service.markFailed("job-3", longMessage, LocalDateTime.now());

        assertEquals(AsyncJobExecutionStatus.FAILED, result.getStatus());
        assertTrue(result.getErrorMessage().length() <= 1000);
        assertNull(result.getArtifactPath());
        assertNull(result.getArtifactMimeType());
        verify(repository).findByJobName(eq("job-3"));
    }
}
