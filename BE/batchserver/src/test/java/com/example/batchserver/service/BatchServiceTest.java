package com.example.batchserver.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.batch.core.*;
import org.springframework.batch.core.launch.JobLauncher;

import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import com.example.servercommon.exception.InvalidJobNameException;
import com.example.servercommon.message.BackendMessageCatalog;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class BatchServiceTest {

    @Mock
    private JobLauncher jobLauncher;

    @Mock
    private Job job;

    @InjectMocks
    private BatchService batchService;

    private final String jobName = "csvUserImportJobV1";

    Map<String, String> formData = new HashMap<>();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        Map<String, Job> jobMap = new HashMap<>();
        jobMap.put(jobName, job);
        batchService = new BatchService(jobLauncher, jobMap);

        formData.put("templateId", "TEMPLATE-001");
        formData.put("filename", "dummy_file.csv");
        formData.put("filePath", Paths.get("/tmp/uploads/dummy_file.csv").toAbsolutePath().toString());
        formData.put("locale", Locale.JAPAN.getLanguage()); // "ja"
        formData.put("jobName", "fileImportJob");
    }

    @Test
    void runJob_shouldLaunchJob_whenJobExists() throws Exception {
        // Arrange
        when(jobLauncher.run(eq(job), any(JobParameters.class))).thenReturn(mock(JobExecution.class));

        // Act & Assert
        assertDoesNotThrow(() -> batchService.runJob(jobName,formData));
        verify(jobLauncher, times(1)).run(eq(job), any(JobParameters.class));
    }

    @Test
    void runJob_shouldThrowException_whenJobNotFound() {
        // Arrange
        String invalidJobName = "unknownJob";

        // Act & Assert
        InvalidJobNameException exception = assertThrows(
                InvalidJobNameException.class,
                () -> batchService.runJob(invalidJobName, formData));
        assertEquals(
                BackendMessageCatalog.format(BackendMessageCatalog.EX_JOB_NOT_FOUND, invalidJobName),
                exception.getMessage());
        verifyNoInteractions(jobLauncher);
    }
}
