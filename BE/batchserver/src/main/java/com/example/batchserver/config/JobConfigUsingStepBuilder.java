package com.example.batchserver.config;

import com.example.batchserver.listener.SampleJobListener;
import com.example.batchserver.listener.SampleStepListener;
import com.example.servercommon.message.BackendMessageCatalog;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@AllArgsConstructor
@Configuration
@Slf4j
public class JobConfigUsingStepBuilder {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;

    @Bean
    public Job myJob(SampleJobListener jobListener, @Qualifier("myStep") Step myStep) {
        return new JobBuilder("myJob", jobRepository)
                .listener(jobListener)
                .start(myStep)
                .build();
    }

    @Bean
    public Step myStep(SampleStepListener stepListener) {
        return new StepBuilder("myStep", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    log.info(BackendMessageCatalog.LOG_SAMPLE_STEP_EXECUTED);
                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .listener(stepListener)
                .build();
    }
}
