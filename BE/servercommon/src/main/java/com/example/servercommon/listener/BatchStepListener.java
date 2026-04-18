package com.example.servercommon.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;

public class BatchStepListener implements StepExecutionListener {

    private static final Logger logger = LoggerFactory.getLogger(BatchStepListener.class);

    @Override
    public void beforeStep(StepExecution stepExecution) {
        logger.info("Step {} is starting.", stepExecution.getStepName());
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        if (stepExecution.getStatus().isUnsuccessful()) {
            logger.error("Step {} failed with status: {}", 
                    stepExecution.getStepName(), stepExecution.getStatus());
        } else {
            logger.info("Step {} completed successfully.", stepExecution.getStepName());
        }
        return stepExecution.getExitStatus();
    }
}
