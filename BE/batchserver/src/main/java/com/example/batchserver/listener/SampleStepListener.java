package com.example.batchserver.listener;

import com.example.servercommon.message.BackendMessageCatalog;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class SampleStepListener implements StepExecutionListener {

    private static final Logger log = LoggerFactory.getLogger(SampleStepListener.class);

    @Override
    public void beforeStep(StepExecution stepExecution) {
        log.info(BackendMessageCatalog.LOG_BATCH_STEP_START, stepExecution.getStepName());
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        log.info(BackendMessageCatalog.LOG_BATCH_STEP_END, stepExecution.getStepName(), stepExecution.getStatus());
        return stepExecution.getExitStatus();
    }
}
