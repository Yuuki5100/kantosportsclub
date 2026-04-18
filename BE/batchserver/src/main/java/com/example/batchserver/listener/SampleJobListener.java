package com.example.batchserver.listener;

import com.example.servercommon.message.BackendMessageCatalog;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class SampleJobListener implements JobExecutionListener {

    private static final Logger log = LoggerFactory.getLogger(SampleJobListener.class);

    @Override
    public void beforeJob(JobExecution jobExecution) {
        log.info(BackendMessageCatalog.LOG_BATCH_JOB_START, jobExecution.getJobInstance().getJobName(), jobExecution.getStartTime());
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        log.info(BackendMessageCatalog.LOG_BATCH_JOB_END,
                jobExecution.getJobInstance().getJobName(),
                jobExecution.getEndTime(),
                jobExecution.getStatus());
    }
}
