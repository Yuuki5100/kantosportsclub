package com.example.servercommon.service;

import com.example.servercommon.enums.SyncOutboxStatus;
import com.example.servercommon.model.SyncOutboxLog;
import com.example.servercommon.repository.SyncOutboxLogRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SyncOutboxServiceTest {

    private SyncOutboxLogRepository syncOutboxLogRepository;
    private SyncOutboxService syncOutboxService;

    @BeforeEach
    void setUp() {
        syncOutboxLogRepository = Mockito.mock(SyncOutboxLogRepository.class);
        syncOutboxService = new SyncOutboxService(syncOutboxLogRepository);
    }

    @Test
    void register_returnsExisting_whenRequestIdAlreadyExists() {
        SyncOutboxLog existing = new SyncOutboxLog();
        existing.setId(1L);
        existing.setRequestId("req-1");
        existing.setStatus(SyncOutboxStatus.SENT);

        when(syncOutboxLogRepository.findByRequestId("req-1")).thenReturn(Optional.of(existing));

        SyncOutboxLog result = syncOutboxService.register("req-1", "NOTICE_CHANGED", "/api/notice/sync", "{}");

        assertSame(existing, result);
        verify(syncOutboxLogRepository, never()).save(any());
    }

    @Test
    void register_savesPendingRecord_whenRequestIdDoesNotExist() {
        when(syncOutboxLogRepository.findByRequestId("req-2")).thenReturn(Optional.empty());
        when(syncOutboxLogRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SyncOutboxLog result = syncOutboxService.register("req-2", "NOTICE_CHANGED", "/api/notice/sync", "{\"x\":1}");

        assertEquals("req-2", result.getRequestId());
        assertEquals(SyncOutboxStatus.PENDING, result.getStatus());
        assertEquals(0, result.getRetryCount());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
    }

    @Test
    void markSent_updatesStatusToSent() {
        SyncOutboxLog target = new SyncOutboxLog();
        target.setRequestId("req-sent");
        target.setStatus(SyncOutboxStatus.PENDING);
        target.setRetryCount(0);
        when(syncOutboxLogRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SyncOutboxLog result = syncOutboxService.markSent(target, "200", "{\"ok\":true}");

        assertEquals(SyncOutboxStatus.SENT, result.getStatus());
        assertEquals("200", result.getLastResponseCode());
        assertNotNull(result.getSentAt());
        assertEquals("{\"ok\":true}", result.getLastResponseBody());
    }

    @Test
    void markFailed_movesToRetryWait_whenRetryableAndWithinMaxRetry() {
        SyncOutboxLog target = new SyncOutboxLog();
        target.setRequestId("req-retry");
        target.setStatus(SyncOutboxStatus.PENDING);
        target.setRetryCount(0);
        when(syncOutboxLogRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SyncOutboxLog result = syncOutboxService.markFailed(
                target,
                true,
                "timeout",
                "500",
                "{\"error\":\"timeout\"}",
                3,
                1000
        );

        assertEquals(SyncOutboxStatus.RETRY_WAIT, result.getStatus());
        assertEquals(1, result.getRetryCount());
        assertNotNull(result.getNextRetryAt());
    }

    @Test
    void markFailed_movesToFailed_whenRetryCountExceedsMaxRetry() {
        SyncOutboxLog target = new SyncOutboxLog();
        target.setRequestId("req-failed");
        target.setStatus(SyncOutboxStatus.RETRY_WAIT);
        target.setRetryCount(3);
        when(syncOutboxLogRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SyncOutboxLog result = syncOutboxService.markFailed(
                target,
                true,
                "server error",
                "500",
                "{\"error\":\"server\"}",
                3,
                1000
        );

        assertEquals(SyncOutboxStatus.FAILED, result.getStatus());
        assertEquals(4, result.getRetryCount());
    }
}
