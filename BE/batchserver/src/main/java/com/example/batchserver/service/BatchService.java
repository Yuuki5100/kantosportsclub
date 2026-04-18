package com.example.batchserver.service;

import java.util.Map;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.example.servercommon.exception.InvalidJobNameException;
import com.example.servercommon.message.BackendMessageCatalog;

import lombok.extern.slf4j.Slf4j;
@Service
@Slf4j
public class BatchService {

    private final JobLauncher jobLauncher;
    private final Map<String, Job> jobMap;

    public BatchService(@Qualifier("asyncJobLauncher") JobLauncher jobLauncher, Map<String, Job> jobMap) {
        this.jobLauncher = jobLauncher;
        this.jobMap = jobMap;
    }

    /**
     * 指定したジョブ名でジョブを実行します。
     *
     * @param jobName    実行するジョブ名
     * @param formParams パラメータ（フォーム入力値など）
     */
    public void runJob(String jobName, Map<String, String> formParams) {
        Job job = jobMap.get(jobName);
        if (job == null) {
            throw new InvalidJobNameException(
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_JOB_NOT_FOUND, jobName));
        }

        // ジョブパラメータ生成
        JobParametersBuilder paramBuilder = new JobParametersBuilder()
                .addLong("timestamp", System.currentTimeMillis());

        // 入力パラメータを動的に追加
        formParams.forEach((key, value) -> {
            if (value != null && value.matches("\\d+")) {
                paramBuilder.addLong(key, Long.parseLong(value));
            } else {
                paramBuilder.addString(key, value);
            }
        });

        JobParameters jobParameters = paramBuilder.toJobParameters();

        try {
            log.info(BackendMessageCatalog.LOG_JOB_RUN_START, jobName);
            jobLauncher.run(job, jobParameters);
            log.info(BackendMessageCatalog.LOG_JOB_RUN_COMPLETED, jobName);
        } catch (JobExecutionAlreadyRunningException e) {
            log.warn(BackendMessageCatalog.LOG_JOB_RUN_FAILED, jobName, e.getMessage(), e);
        } catch (JobRestartException e) {
            log.error(BackendMessageCatalog.LOG_JOB_RUN_FAILED, jobName, e.getMessage(), e);
        } catch (JobInstanceAlreadyCompleteException e) {
            log.warn(BackendMessageCatalog.LOG_JOB_RUN_FAILED, jobName, e.getMessage(), e);
        } catch (JobParametersInvalidException e) {
            log.error(BackendMessageCatalog.LOG_JOB_RUN_FAILED, jobName, e.getMessage(), e);
        }
    }
}
