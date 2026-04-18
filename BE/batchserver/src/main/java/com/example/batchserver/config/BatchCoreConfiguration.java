// BatchCoreConfiguration.java
package com.example.batchserver.config;

import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BatchCoreConfiguration {

    private final JobRepository jobRepository;

    public BatchCoreConfiguration(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Bean
    public JobBuilder jobBuilder() {
        return new JobBuilder("defaultJob", jobRepository);
    }

    @Bean
    public StepBuilder stepBuilder() {
        return new StepBuilder("defaultStep", jobRepository);
    }
}
