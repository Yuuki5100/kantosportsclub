package com.example.appserver.service;

import com.example.appserver.config.NotifyQueueScanProperties;
import com.example.servercommon.enums.NotifyQueueStatus;
import com.example.servercommon.model.NotifyQueue;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.NotifyQueueEvent;
import com.example.servercommon.repository.NotifyQueueRepository;
import com.example.servercommon.utils.DateFormatUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotifyQueueScanService {

    private static final int MAX_ERROR_MESSAGE_LENGTH = 1000;
    private static final List<NotifyQueueStatus> DISPATCHABLE_STATUSES =
            List.of(NotifyQueueStatus.PENDING, NotifyQueueStatus.RETRY_WAIT);

    private final NotifyQueueRepository notifyQueueRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    private final NotifyQueueScanProperties notifyQueueScanProperties;

    /**
     * Scan unnotified records and send WebSocket notifications.
     */
    @Scheduled(fixedDelayString = "${notify.queue.scan.fixed-delay-ms:${notify.queue.scan.fixed-delay:10000000}}")
    public void scanAndNotify() {
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        int scanLimit = Math.max(1, notifyQueueScanProperties.getLimit());
        List<NotifyQueue> unnotifiedQueues = notifyQueueRepository.findDispatchTargets(
                DISPATCHABLE_STATUSES,
                now,
                PageRequest.of(0, scanLimit));

        if (unnotifiedQueues.isEmpty()) {
            return;
        }

        log.debug(BackendMessageCatalog.LOG_NOTIFY_SCAN_FOUND, unnotifiedQueues.size());

        int successCount = 0;
        int failureCount = 0;

        for (NotifyQueue queue : unnotifiedQueues) {
            try {
                // Re-check the latest state before sending.
                NotifyQueue currentQueue = notifyQueueRepository.findById(queue.getId()).orElse(null);
                if (currentQueue == null || currentQueue.getNotified() || !isDispatchable(currentQueue, now)) {
                    continue;
                }

                processQueueEntry(currentQueue);
                successCount++;

            } catch (Exception e) {
                failureCount++;
                log.warn(BackendMessageCatalog.LOG_NOTIFY_SCAN_ERROR, queue.getId(), e.getMessage(), e);
            }
        }

        log.info(BackendMessageCatalog.LOG_NOTIFY_SCAN_FINISHED, successCount, failureCount);
    }

    /**
     * Scan by refId (manual trigger).
     */
    public void scanAndNotifyById(Long refId) {
        NotifyQueue queue = notifyQueueRepository
                .findTop1ByRefIdAndStatusInOrderByCreatedAtDesc(refId, DISPATCHABLE_STATUSES)
                .orElse(null);
        if (queue == null) {
            return;
        }

        processQueueEntry(queue);
    }

    private void processQueueEntry(NotifyQueue entry) {
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        try {
            NotifyQueueEvent event = NotifyQueueEvent.builder()
                    .eventType(entry.getEventType())
                    .refId(entry.getRefId())
                    .build();

            webSocketNotificationService.notifyByType(entry.getEventType(), event);

            log.info(BackendMessageCatalog.LOG_NOTIFY_DELIVERED, entry.getId(), entry.getEventType());

            entry.setStatus(NotifyQueueStatus.SENT);
            entry.setNotified(true);
            entry.setLastAttemptedAt(now);
            entry.setNextAttemptAt(null);
            entry.setLastErrorMessage(null);
        } catch (Exception e) {
            log.warn(BackendMessageCatalog.LOG_NOTIFY_FAILED, entry.getId(), entry.getEventType(), e.getMessage(), e);
            markRetryState(entry, now, e);
        }

        notifyQueueRepository.save(entry);
    }

    private void markRetryState(NotifyQueue entry, LocalDateTime now, Exception error) {
        int retryCount = (entry.getRetryCount() == null ? 0 : entry.getRetryCount()) + 1;
        int maxRetry = resolveMaxRetry(entry);

        entry.setRetryCount(retryCount);
        entry.setNotified(false);
        entry.setLastAttemptedAt(now);
        entry.setLastErrorMessage(truncate(error != null ? error.getMessage() : null, MAX_ERROR_MESSAGE_LENGTH));

        if (retryCount >= maxRetry) {
            entry.setStatus(NotifyQueueStatus.FAILED);
            entry.setNextAttemptAt(null);
            log.warn(BackendMessageCatalog.LOG_NOTIFY_FINAL_FAILED,
                    entry.getId(), entry.getEventType(), retryCount, entry.getLastErrorMessage());
            return;
        }

        long backoffDelayMs = calculateBackoffDelayMs(retryCount);
        LocalDateTime nextAttemptAt = now.plusNanos(backoffDelayMs * 1_000_000L);
        entry.setStatus(NotifyQueueStatus.RETRY_WAIT);
        entry.setNextAttemptAt(nextAttemptAt);
        log.info(BackendMessageCatalog.LOG_NOTIFY_RETRY_WAIT,
                entry.getId(), entry.getEventType(), retryCount, nextAttemptAt);
    }

    private int resolveMaxRetry(NotifyQueue entry) {
        int configured = Math.max(1, notifyQueueScanProperties.getMaxRetry());
        Integer maxRetry = entry.getMaxRetry();
        if (maxRetry == null || maxRetry < 1) {
            entry.setMaxRetry(configured);
            return configured;
        }
        return maxRetry;
    }

    private long calculateBackoffDelayMs(int retryCount) {
        long initialDelay = Math.max(0L, notifyQueueScanProperties.getBackoffInitialDelayMs());
        long maxDelay = Math.max(initialDelay, notifyQueueScanProperties.getBackoffMaxDelayMs());
        double multiplier = Math.max(1.0d, notifyQueueScanProperties.getBackoffMultiplier());
        int safeRetryCount = Math.max(1, retryCount);

        if (initialDelay == 0L) {
            return 0L;
        }

        double calculated = initialDelay * Math.pow(multiplier, safeRetryCount - 1L);
        if (Double.isNaN(calculated) || Double.isInfinite(calculated)) {
            return maxDelay;
        }

        long rounded = Math.round(calculated);
        long nonNegative = Math.max(0L, rounded);
        return Math.min(maxDelay, nonNegative);
    }

    private boolean isDispatchable(NotifyQueue entry, LocalDateTime now) {
        if (entry == null || entry.getStatus() == null || entry.getNotified()) {
            return false;
        }
        if (!DISPATCHABLE_STATUSES.contains(entry.getStatus())) {
            return false;
        }
        return entry.getNextAttemptAt() == null || !entry.getNextAttemptAt().isAfter(now);
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
