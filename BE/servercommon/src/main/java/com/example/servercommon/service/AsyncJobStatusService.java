package com.example.servercommon.service;

import com.example.servercommon.enums.AsyncJobExecutionStatus;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.AsyncJobExecution;
import com.example.servercommon.repository.AsyncJobExecutionRepository;
import com.example.servercommon.utils.DateFormatUtil;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncJobStatusService {

    private static final int MAX_ERROR_MESSAGE_LENGTH = 1000;

    private final AsyncJobExecutionRepository asyncJobExecutionRepository;

    @Transactional
    public AsyncJobExecution registerPending(String jobName, String jobType, LocalDateTime expiresAt) {
        return asyncJobExecutionRepository.findByJobName(jobName)
                .orElseGet(() -> createPending(jobName, jobType, expiresAt));
    }

    @Transactional
    public AsyncJobExecution markRunning(String jobName, String jobType, LocalDateTime expiresAt) {
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        AsyncJobExecution target = asyncJobExecutionRepository.findByJobName(jobName)
                .orElseGet(() -> createPending(jobName, jobType, expiresAt));

        target.setStatus(AsyncJobExecutionStatus.RUNNING);
        if (target.getStartedAt() == null) {
            target.setStartedAt(now);
        }
        target.setEndedAt(null);
        target.setErrorMessage(null);
        target.setArtifactPath(null);
        target.setArtifactMimeType(null);
        target.setUpdatedAt(now);
        return asyncJobExecutionRepository.save(target);
    }

    @Transactional
    public AsyncJobExecution markCompleted(
            String jobName,
            String artifactPath,
            String artifactMimeType,
            LocalDateTime endedAt
    ) {
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        AsyncJobExecution target = getRequired(jobName);
        target.setStatus(AsyncJobExecutionStatus.COMPLETED);
        target.setArtifactPath(artifactPath);
        target.setArtifactMimeType(artifactMimeType);
        target.setErrorMessage(null);
        target.setEndedAt(endedAt != null ? endedAt : now);
        target.setUpdatedAt(now);
        return asyncJobExecutionRepository.save(target);
    }

    @Transactional
    public AsyncJobExecution markFailed(String jobName, String errorMessage, LocalDateTime endedAt) {
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        AsyncJobExecution target = getRequired(jobName);
        target.setStatus(AsyncJobExecutionStatus.FAILED);
        target.setArtifactPath(null);
        target.setArtifactMimeType(null);
        target.setErrorMessage(truncate(errorMessage, MAX_ERROR_MESSAGE_LENGTH));
        target.setEndedAt(endedAt != null ? endedAt : now);
        target.setUpdatedAt(now);
        return asyncJobExecutionRepository.save(target);
    }

    @Transactional(readOnly = true)
    public Optional<AsyncJobExecution> findByJobName(String jobName) {
        return asyncJobExecutionRepository.findByJobName(jobName);
    }

    @Transactional(readOnly = true)
    public List<AsyncJobExecution> findExpiredTargets(int limit) {
        int safeLimit = Math.max(1, limit);
        return asyncJobExecutionRepository.findExpiredTargets(
                DateFormatUtil.nowUtcLocalDateTime(),
                PageRequest.of(0, safeLimit));
    }

    @Transactional
    public AsyncJobExecution markExpired(String jobName) {
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        AsyncJobExecution target = getRequired(jobName);
        target.setStatus(AsyncJobExecutionStatus.EXPIRED);
        target.setArtifactPath(null);
        target.setArtifactMimeType(null);
        if (target.getEndedAt() == null) {
            target.setEndedAt(now);
        }
        target.setUpdatedAt(now);
        return asyncJobExecutionRepository.save(target);
    }

    private AsyncJobExecution createPending(String jobName, String jobType, LocalDateTime expiresAt) {
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        AsyncJobExecution created = new AsyncJobExecution();
        created.setJobName(jobName);
        created.setJobType(jobType);
        created.setStatus(AsyncJobExecutionStatus.PENDING);
        created.setExpiresAt(expiresAt);
        created.setCreatedAt(now);
        created.setUpdatedAt(now);
        return asyncJobExecutionRepository.save(created);
    }

    private AsyncJobExecution getRequired(String jobName) {
        return asyncJobExecutionRepository.findByJobName(jobName)
                .orElseThrow(() -> new IllegalStateException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_JOB_NOT_FOUND, jobName)));
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
