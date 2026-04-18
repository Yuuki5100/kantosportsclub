package com.example.appserver.service;

import com.example.appserver.config.AsyncJobProperties;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.AsyncJobExecution;
import com.example.servercommon.service.AsyncJobArtifactService;
import com.example.servercommon.service.AsyncJobStatusService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncJobCleanupService {

    private final AsyncJobStatusService asyncJobStatusService;
    private final AsyncJobArtifactService asyncJobArtifactService;
    private final AsyncJobProperties asyncJobProperties;

    @Scheduled(fixedDelayString = "${async.job.cleanup-fixed-delay-ms:600000}")
    public void cleanupExpiredJobs() {
        List<AsyncJobExecution> targets = asyncJobStatusService.findExpiredTargets(
                asyncJobProperties.getCleanupBatchSize());
        if (targets.isEmpty()) {
            return;
        }

        log.info(BackendMessageCatalog.LOG_ASYNC_JOB_CLEANUP_SCAN, targets.size());
        for (AsyncJobExecution target : targets) {
            try {
                asyncJobArtifactService.deleteQuietly(target.getArtifactPath());
                asyncJobStatusService.markExpired(target.getJobName());
                log.info(BackendMessageCatalog.LOG_ASYNC_JOB_EXPIRED, target.getJobName(), target.getArtifactPath());
            } catch (Exception ex) {
                log.warn(BackendMessageCatalog.LOG_ASYNC_JOB_CLEANUP_ERROR,
                        target.getJobName(), ex.getMessage(), ex);
            }
        }
    }
}
