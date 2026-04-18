package com.example.appserver.service;

import com.example.appserver.config.NotifyQueueScanProperties;
import com.example.servercommon.enums.NotifyQueueStatus;
import com.example.servercommon.model.NotifyQueue;
import com.example.servercommon.repository.NotifyQueueRepository;
import com.example.servercommon.utils.DateFormatUtil;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotifyQueueScanServiceTest {

    @Mock
    private NotifyQueueRepository notifyQueueRepository;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    private NotifyQueueScanService notifyQueueScanService;

    @BeforeEach
    void setUp() {
        NotifyQueueScanProperties props = new NotifyQueueScanProperties();
        props.setLimit(10);
        props.setMaxRetry(3);
        props.setBackoffInitialDelayMs(1000);
        props.setBackoffMultiplier(2.0d);
        props.setBackoffMaxDelayMs(10_000);
        notifyQueueScanService = new NotifyQueueScanService(
                notifyQueueRepository,
                webSocketNotificationService,
                props);
    }

    @Test
    void scanAndNotify_marksSentWhenDeliverySucceeds() {
        NotifyQueue queue = createQueue(1L, NotifyQueueStatus.PENDING, 0, 3,
                DateFormatUtil.nowUtcLocalDateTime().minusSeconds(1));
        when(notifyQueueRepository.findDispatchTargets(anyCollection(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(queue));
        when(notifyQueueRepository.findById(1L)).thenReturn(Optional.of(queue));

        notifyQueueScanService.scanAndNotify();

        ArgumentCaptor<NotifyQueue> captor = ArgumentCaptor.forClass(NotifyQueue.class);
        verify(notifyQueueRepository).save(captor.capture());
        NotifyQueue saved = captor.getValue();

        assertThat(saved.getStatus()).isEqualTo(NotifyQueueStatus.SENT);
        assertThat(saved.getNotified()).isTrue();
        assertThat(saved.getNextAttemptAt()).isNull();
        assertThat(saved.getLastErrorMessage()).isNull();
        assertThat(saved.getLastAttemptedAt()).isNotNull();
    }

    @Test
    void scanAndNotify_movesToRetryWaitWhenTemporaryFailureOccurs() {
        NotifyQueue queue = createQueue(2L, NotifyQueueStatus.PENDING, 0, 3,
                DateFormatUtil.nowUtcLocalDateTime().minusSeconds(1));
        when(notifyQueueRepository.findDispatchTargets(anyCollection(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(queue));
        when(notifyQueueRepository.findById(2L)).thenReturn(Optional.of(queue));
        doThrow(new RuntimeException("temporary ws error"))
                .when(webSocketNotificationService)
                .notifyByType(eq(queue.getEventType()), any());

        notifyQueueScanService.scanAndNotify();

        ArgumentCaptor<NotifyQueue> captor = ArgumentCaptor.forClass(NotifyQueue.class);
        verify(notifyQueueRepository).save(captor.capture());
        NotifyQueue saved = captor.getValue();

        assertThat(saved.getStatus()).isEqualTo(NotifyQueueStatus.RETRY_WAIT);
        assertThat(saved.getRetryCount()).isEqualTo(1);
        assertThat(saved.getNotified()).isFalse();
        assertThat(saved.getNextAttemptAt()).isAfter(saved.getLastAttemptedAt());
        assertThat(saved.getLastErrorMessage()).contains("temporary ws error");
    }

    @Test
    void scanAndNotify_movesToFailedWhenRetryLimitReached() {
        NotifyQueue queue = createQueue(3L, NotifyQueueStatus.PENDING, 0, 1,
                DateFormatUtil.nowUtcLocalDateTime().minusSeconds(1));
        when(notifyQueueRepository.findDispatchTargets(anyCollection(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(queue));
        when(notifyQueueRepository.findById(3L)).thenReturn(Optional.of(queue));
        doThrow(new RuntimeException("permanent ws error"))
                .when(webSocketNotificationService)
                .notifyByType(eq(queue.getEventType()), any());

        notifyQueueScanService.scanAndNotify();

        ArgumentCaptor<NotifyQueue> captor = ArgumentCaptor.forClass(NotifyQueue.class);
        verify(notifyQueueRepository).save(captor.capture());
        NotifyQueue saved = captor.getValue();

        assertThat(saved.getStatus()).isEqualTo(NotifyQueueStatus.FAILED);
        assertThat(saved.getRetryCount()).isEqualTo(1);
        assertThat(saved.getNotified()).isFalse();
        assertThat(saved.getNextAttemptAt()).isNull();
        assertThat(saved.getLastErrorMessage()).contains("permanent ws error");
    }

    @Test
    void scanAndNotify_skipsWhenQueueIsNoLongerDispatchable() {
        NotifyQueue queue = createQueue(4L, NotifyQueueStatus.RETRY_WAIT, 1, 3,
                DateFormatUtil.nowUtcLocalDateTime().plusMinutes(5));
        when(notifyQueueRepository.findDispatchTargets(anyCollection(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(queue));
        when(notifyQueueRepository.findById(4L)).thenReturn(Optional.of(queue));

        notifyQueueScanService.scanAndNotify();

        verify(webSocketNotificationService, never()).notifyByType(any(), any());
        verify(notifyQueueRepository, never()).save(any());
    }

    @Test
    void scanAndNotifyById_processesOnlyDispatchableStatuses() {
        NotifyQueue queue = createQueue(5L, NotifyQueueStatus.PENDING, 0, 3,
                DateFormatUtil.nowUtcLocalDateTime().minusSeconds(1));
        when(notifyQueueRepository.findTop1ByRefIdAndStatusInOrderByCreatedAtDesc(eq(999L), anyCollection()))
                .thenReturn(Optional.of(queue));

        notifyQueueScanService.scanAndNotifyById(999L);

        verify(webSocketNotificationService).notifyByType(eq(queue.getEventType()), any());
        verify(notifyQueueRepository).save(any(NotifyQueue.class));
    }

    private NotifyQueue createQueue(Long id, NotifyQueueStatus status, int retryCount, int maxRetry, LocalDateTime nextAttemptAt) {
        return NotifyQueue.builder()
                .id(id)
                .eventType("FILE_DOWNLOAD_COMPLETED")
                .refId(100L + id)
                .status(status)
                .notified(false)
                .retryCount(retryCount)
                .maxRetry(maxRetry)
                .createdAt(DateFormatUtil.nowUtcLocalDateTime().minusMinutes(1))
                .nextAttemptAt(nextAttemptAt)
                .build();
    }
}
