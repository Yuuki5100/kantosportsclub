package com.example.servercommon.service;

import com.example.servercommon.enums.SyncOutboxStatus;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.SyncOutboxLog;
import com.example.servercommon.repository.SyncOutboxLogRepository;
import com.example.servercommon.utils.DateFormatUtil;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SyncOutboxService {

    private static final int MAX_ERROR_MESSAGE_LENGTH = 1000;
    private static final int MAX_RESPONSE_CODE_LENGTH = 64;

    private final SyncOutboxLogRepository syncOutboxLogRepository;

    @Transactional
    public SyncOutboxLog register(String requestId, String requestType, String requestPath, String payload) {
        return syncOutboxLogRepository.findByRequestId(requestId)
                .map(existing -> {
                    log.info(BackendMessageCatalog.LOG_SYNC_OUTBOX_DUPLICATE,
                            requestId, existing.getStatus());
                    return existing;
                })
                .orElseGet(() -> {
                    LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
                    SyncOutboxLog outbox = new SyncOutboxLog();
                    outbox.setRequestId(requestId);
                    outbox.setRequestType(requestType);
                    outbox.setRequestPath(requestPath);
                    outbox.setPayload(payload);
                    outbox.setStatus(SyncOutboxStatus.PENDING);
                    outbox.setRetryCount(0);
                    outbox.setCreatedAt(now);
                    outbox.setUpdatedAt(now);
                    SyncOutboxLog saved = syncOutboxLogRepository.save(outbox);
                    log.info(BackendMessageCatalog.LOG_SYNC_OUTBOX_REGISTERED,
                            saved.getRequestId(), saved.getRequestType(), saved.getRequestPath());
                    return saved;
                });
    }

    @Transactional(readOnly = true)
    public List<SyncOutboxLog> findDispatchTargets(int limit) {
        int safeLimit = Math.max(1, limit);
        return syncOutboxLogRepository.findDispatchTargets(
                DateFormatUtil.nowUtcLocalDateTime(),
                PageRequest.of(0, safeLimit));
    }

    @Transactional
    public SyncOutboxLog markSent(SyncOutboxLog outbox, String responseCode, String responseBody) {
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        outbox.setStatus(SyncOutboxStatus.SENT);
        outbox.setNextRetryAt(null);
        outbox.setLastErrorMessage(null);
        outbox.setLastResponseCode(truncate(responseCode, MAX_RESPONSE_CODE_LENGTH));
        outbox.setLastResponseBody(responseBody);
        outbox.setSentAt(now);
        outbox.setUpdatedAt(now);

        SyncOutboxLog saved = syncOutboxLogRepository.save(outbox);
        log.info(BackendMessageCatalog.LOG_SYNC_OUTBOX_SENT, saved.getRequestId(), saved.getRequestType());
        return saved;
    }

    @Transactional
    public SyncOutboxLog markFailed(
            SyncOutboxLog outbox,
            boolean retryable,
            String errorMessage,
            String responseCode,
            String responseBody,
            int maxRetry,
            long retryDelayMillis
    ) {
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        int retryCount = (outbox.getRetryCount() == null ? 0 : outbox.getRetryCount()) + 1;

        outbox.setRetryCount(retryCount);
        outbox.setLastErrorMessage(truncate(errorMessage, MAX_ERROR_MESSAGE_LENGTH));
        outbox.setLastResponseCode(truncate(responseCode, MAX_RESPONSE_CODE_LENGTH));
        outbox.setLastResponseBody(responseBody);
        outbox.setUpdatedAt(now);

        if (retryable && retryCount <= maxRetry) {
            LocalDateTime nextRetryAt = now.plusNanos(retryDelayMillis * 1_000_000L);
            outbox.setStatus(SyncOutboxStatus.RETRY_WAIT);
            outbox.setNextRetryAt(nextRetryAt);
            outbox.setSentAt(null);
            SyncOutboxLog saved = syncOutboxLogRepository.save(outbox);
            log.info(BackendMessageCatalog.LOG_SYNC_OUTBOX_RETRY_WAIT,
                    saved.getRequestId(), saved.getRetryCount(), saved.getNextRetryAt());
            return saved;
        }

        outbox.setStatus(SyncOutboxStatus.FAILED);
        outbox.setNextRetryAt(null);
        outbox.setSentAt(null);
        SyncOutboxLog saved = syncOutboxLogRepository.save(outbox);
        log.warn(BackendMessageCatalog.LOG_SYNC_OUTBOX_FAILED,
                saved.getRequestId(), saved.getRetryCount(), saved.getLastErrorMessage());
        return saved;
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
