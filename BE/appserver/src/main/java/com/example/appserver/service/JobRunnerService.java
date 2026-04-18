package com.example.appserver.service;

import com.example.servercommon.enums.JobType;
import com.example.servercommon.enums.StatusType;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.repository.JobStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobRunnerService {

    private final JobStatusRepository jobStatusRepository;

    /**
     * ジョブを非同期に実行し、ステータスを更新
     */
    @Async("taskExecutor")
    public void runJob(String jobName) {
        log.info(BackendMessageCatalog.LOG_JOB_RUN_START, jobName);

        // ステータスをRUNNINGにして保存
        JobStatus status = JobStatus.builder()
                .jobName(jobName)
                .status(StatusType.RUNNING.getStatusType())
                // TODO(timezone): replace LocalDateTime.now() with UTC clock/provider before persisting.
                .startTime(LocalDateTime.now())
                .build();
        jobStatusRepository.save(status);

        try {
            // 本処理（ここでは仮にスリープ）
            Thread.sleep(3000); // 仮のジョブ処理

            status.setStatus(StatusType.SUCCESS.getStatusType());
            status.setMessage(BackendMessageCatalog.MSG_JOB_COMPLETED_JA);
            log.info(BackendMessageCatalog.LOG_JOB_RUN_COMPLETED, jobName);

        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_JOB_RUN_FAILED, jobName, e.getMessage(), e);
            status.setStatus(StatusType.FAILED.getStatusType());
            status.setMessage(e.getMessage());
        }

        // TODO(timezone): replace LocalDateTime.now() with UTC clock/provider before persisting.
        status.setEndTime(LocalDateTime.now());
        jobStatusRepository.save(status);
    }

    // ダミージョブ
    @Async("taskExecutor")
    public void runDummyJob() {
        String jobName = "dummyJob";

        JobStatus status = JobStatus.builder()
                .jobName(jobName)
                .jobType(JobType.DUMMY_JOB.getCode()) // ← Enumからセット
                .status(StatusType.RUNNING.getStatusType()) // ← Enumからセット
                // TODO(timezone): replace LocalDateTime.now() with UTC clock/provider before persisting.
                .startTime(LocalDateTime.now())
                .build();
        jobStatusRepository.save(status);

        try {
            log.info(BackendMessageCatalog.LOG_DUMMY_JOB_STARTED);
            Thread.sleep(3000);
            status.setStatus(StatusType.SUCCESS.getStatusType());
            status.setMessage(BackendMessageCatalog.MSG_DUMMY_JOB_COMPLETED);
        } catch (Exception e) {
            status.setStatus(StatusType.FAILED.getStatusType());
            status.setMessage(BackendMessageCatalog.format(BackendMessageCatalog.MSG_ERROR_PREFIX, e.getMessage()));
        }

        // TODO(timezone): replace LocalDateTime.now() with UTC clock/provider before persisting.
        status.setEndTime(LocalDateTime.now());
        jobStatusRepository.save(status);
    }

}
