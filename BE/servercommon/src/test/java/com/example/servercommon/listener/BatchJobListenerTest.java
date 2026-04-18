package com.example.servercommon.listener;

import com.example.servercommon.notification.TeamsNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobInstance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class BatchJobListenerTest {

    private TeamsNotificationService teamsNotificationService;
    private BatchJobListener listener;

    @BeforeEach
    void setUp() {
        teamsNotificationService = mock(TeamsNotificationService.class);
        listener = new BatchJobListener(teamsNotificationService);
    }

    private JobExecution createJobExecution(String jobName, BatchStatus status, ExitStatus exitStatus) {
        JobInstance jobInstance = new JobInstance(1L, jobName);
        JobExecution jobExecution = new JobExecution(1L);
        jobExecution.setJobInstance(jobInstance);
        jobExecution.setStatus(status);
        jobExecution.setExitStatus(exitStatus);
        return jobExecution;
    }

    @Test
    void beforeJob_logsStartMessage() {
        JobExecution jobExecution = createJobExecution("testJob", BatchStatus.STARTING, ExitStatus.EXECUTING);
        listener.beforeJob(jobExecution);
        // ログ出力の確認は不要（例外が出ないことを確認）
    }

    @Test
    void afterJob_whenJobFails_sendsNotification() {
        JobExecution jobExecution = createJobExecution("failedJob", BatchStatus.FAILED, ExitStatus.FAILED);

        listener.afterJob(jobExecution);

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(teamsNotificationService, times(1)).sendNotification(captor.capture());
        String message = captor.getValue();

        assertThat(message).contains("failedJob");
        assertThat(message).contains("FAILED");
    }

    @Test
    void afterJob_whenJobSucceeds_doesNotSendNotification() {
        JobExecution jobExecution = createJobExecution("successJob", BatchStatus.COMPLETED, ExitStatus.COMPLETED);

        listener.afterJob(jobExecution);

        verify(teamsNotificationService, never()).sendNotification(anyString());
    }
}
