package com.example.appserver.service;

import com.example.appserver.config.NotifyQueueScanProperties;
import com.example.servercommon.enums.NotifyQueueStatus;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.NotifyQueue;
import com.example.servercommon.repository.NotifyQueueRepository;
import com.example.servercommon.utils.DateFormatUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotifyQueuePublisherImpl implements NotifyQueuePublisher {

    private final NotifyQueueRepository notifyQueueRepository;
    private final NotifyQueueScanProperties notifyQueueScanProperties;

    @Override
    public void publish(String eventType, Long refId) {
        var now = DateFormatUtil.nowUtcLocalDateTime();
        int maxRetry = Math.max(1, notifyQueueScanProperties.getMaxRetry());
        NotifyQueue queue = NotifyQueue.builder()
                .eventType(eventType)
                .refId(refId)
                .status(NotifyQueueStatus.PENDING)
                .notified(false)
                .retryCount(0)
                .maxRetry(maxRetry)
                .createdAt(now)
                .nextAttemptAt(now)
                .build();

        notifyQueueRepository.save(queue);

        log.info(BackendMessageCatalog.LOG_NOTIFY_QUEUE_REGISTERED, eventType, refId);
    }
}
