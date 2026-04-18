package com.example.servercommon.listener;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;

import static org.mockito.Mockito.*;

class BatchStepListenerTest {

    private BatchStepListener listener;

    @BeforeEach
    void setUp() {
        listener = new BatchStepListener();
    }

    @Test
    void beforeStep_logsStartMessage() {
        StepExecution stepExecution = mock(StepExecution.class);
        when(stepExecution.getStepName()).thenReturn("testStep");

        listener.beforeStep(stepExecution);

        // ログ確認は省略、例外が出ないことを確認
    }

    @Test
    void afterStep_whenStepFails_logsError() {
        StepExecution stepExecution = mock(StepExecution.class);
        when(stepExecution.getStepName()).thenReturn("failedStep");
        when(stepExecution.getStatus()).thenReturn(BatchStatus.FAILED);
        when(stepExecution.getExitStatus()).thenReturn(ExitStatus.FAILED);

        ExitStatus exitStatus = listener.afterStep(stepExecution);

        assert exitStatus == ExitStatus.FAILED;
    }

    @Test
    void afterStep_whenStepSucceeds_logsInfo() {
        StepExecution stepExecution = mock(StepExecution.class);
        when(stepExecution.getStepName()).thenReturn("successStep");
        when(stepExecution.getStatus()).thenReturn(BatchStatus.COMPLETED);
        when(stepExecution.getExitStatus()).thenReturn(ExitStatus.COMPLETED);

        ExitStatus exitStatus = listener.afterStep(stepExecution);

        assert exitStatus == ExitStatus.COMPLETED;
    }
}
