package com.example.servercommon.listener;

import com.example.servercommon.notification.TeamsNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListenerSupport;

public class BatchJobListener extends JobExecutionListenerSupport {

    private static final Logger logger = LoggerFactory.getLogger(BatchJobListener.class);
    
    private final TeamsNotificationService teamsNotificationService;

    public BatchJobListener(TeamsNotificationService teamsNotificationService) {
        this.teamsNotificationService = teamsNotificationService;
    }

    @Override
    public void beforeJob(JobExecution jobExecution) {
        logger.info("Job {} is starting.", jobExecution.getJobInstance().getJobName());
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus().isUnsuccessful()) {
            logger.error("Job {} failed. Exit status: {}", 
                    jobExecution.getJobInstance().getJobName(), 
                    jobExecution.getExitStatus());
            teamsNotificationService.sendNotification("Job " + jobExecution.getJobInstance().getJobName() 
                    + " failed. Exit status: " + jobExecution.getExitStatus());
        } else {
            logger.info("Job {} completed successfully.", jobExecution.getJobInstance().getJobName());
        }
    }
}
