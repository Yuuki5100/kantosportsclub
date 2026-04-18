package com.example.batchserver.scheduler;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.repository.NotifyQueueRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotifyQueueCleanupService {

    private final NotifyQueueRepository notifyQueueRepository;

    @Scheduled(cron = "0 0 3 * * *") // 毎日3:00
    @Transactional
    public void cleanupOldNotifies() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(7);
        int deleted = notifyQueueRepository.deleteByNotifiedTrueAndCreatedAtBefore(threshold);
        log.info(BackendMessageCatalog.LOG_NOTIFY_QUEUE_CLEANUP, deleted, threshold);
    }
}
