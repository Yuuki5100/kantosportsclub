package com.example.batchserver.jobs;

import com.example.servercommon.listener.BatchJobListener;
import com.example.servercommon.listener.BatchStepListener;
import com.example.batchserver.tasklet.CsvUserImportTasklet;
import com.example.servercommon.notification.TeamsNotificationService;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class CsvUserImportJobConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final CsvUserImportTasklet csvUserImportTasklet;
    private final TeamsNotificationService teamsNotificationService;  // Teams通知用

    public CsvUserImportJobConfig(JobRepository jobRepository,
                                  PlatformTransactionManager transactionManager,
                                  CsvUserImportTasklet csvUserImportTasklet,
                                  TeamsNotificationService teamsNotificationService) {
        this.jobRepository = jobRepository;
        this.transactionManager = transactionManager;
        this.csvUserImportTasklet = csvUserImportTasklet;
        this.teamsNotificationService = teamsNotificationService;
    }

    @Bean(name = "csvUserImportJobV1")
    public Job csvUserImportJob() {
            // BatchJobListener を組み込む
        BatchJobListener jobListener = new BatchJobListener(teamsNotificationService);
        return new JobBuilder("csvUserImportJob", jobRepository)
                .listener(jobListener)
                .start(importUserStep())
                .build();
    }

    @Bean
    public Step importUserStep() {
        // BatchStepListener を組み込む場合（必要に応じて）
        BatchStepListener stepListener = new BatchStepListener();
        return new StepBuilder("importUserStep", jobRepository)
                .tasklet(csvUserImportTasklet, transactionManager)
                .listener(stepListener)
                .build();
    }
}
