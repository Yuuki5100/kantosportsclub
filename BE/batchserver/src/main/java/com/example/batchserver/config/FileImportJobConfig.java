package com.example.batchserver.config;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import com.example.batchserver.tasklet.FileValidationTasklet;

import lombok.AllArgsConstructor;

@Configuration
@AllArgsConstructor
public class FileImportJobConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private FileValidationTasklet fileValidationTasklet;

    @Bean
    public Job fileImportJob() {
        return new JobBuilder("fileImportJob", jobRepository)
                .start(someStep())
                .build();
    }

    @Bean
    public Step someStep() {
        return new StepBuilder("someStep", jobRepository)
                .tasklet(fileValidationTasklet, transactionManager)
                .build();
    }
}
