package com.example.batchserver.listener;

import com.example.servercommon.message.BackendMessageCatalog;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListenerSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class SimpleJobListener extends JobExecutionListenerSupport {

    private static final Logger log = LoggerFactory.getLogger(SimpleJobListener.class);

    @Override
    public void beforeJob(JobExecution jobExecution) {
        log.info(BackendMessageCatalog.LOG_BATCH_JOB_PREPARE, jobExecution.getJobInstance().getJobName());
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        log.info(BackendMessageCatalog.LOG_BATCH_JOB_DONE, jobExecution.getJobInstance().getJobName(), jobExecution.getStatus());
    }
}
