package com.example.appserver.service;

import com.example.appserver.config.NotifyQueueScanProperties;
import com.example.servercommon.enums.NotifyQueueStatus;
import com.example.servercommon.model.NotifyQueue;
import com.example.servercommon.repository.NotifyQueueRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotifyQueuePublisherImplTest {

    @Mock
    private NotifyQueueRepository notifyQueueRepository;

    @Mock
    private NotifyQueueScanProperties notifyQueueScanProperties;

    @InjectMocks
    private NotifyQueuePublisherImpl notifyQueuePublisher;

    @Captor
    private ArgumentCaptor<NotifyQueue> queueCaptor;

    @Test
    void publish_savesNotifyQueueWithInitialRetryControlState() {
        when(notifyQueueScanProperties.getMaxRetry()).thenReturn(7);

        String eventType = "TEST_EVENT";
        Long refId = 123L;
        notifyQueuePublisher.publish(eventType, refId);

        verify(notifyQueueRepository, times(1)).save(queueCaptor.capture());
        NotifyQueue savedQueue = queueCaptor.getValue();

        assertThat(savedQueue.getEventType()).isEqualTo(eventType);
        assertThat(savedQueue.getRefId()).isEqualTo(refId);
        assertThat(savedQueue.getStatus()).isEqualTo(NotifyQueueStatus.PENDING);
        assertThat(savedQueue.getNotified()).isFalse();
        assertThat(savedQueue.getRetryCount()).isEqualTo(0);
        assertThat(savedQueue.getMaxRetry()).isEqualTo(7);
        assertThat(savedQueue.getCreatedAt()).isBeforeOrEqualTo(LocalDateTime.now());
        assertThat(savedQueue.getNextAttemptAt()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    void publish_clampsMaxRetryToOneOrMore() {
        when(notifyQueueScanProperties.getMaxRetry()).thenReturn(0);

        notifyQueuePublisher.publish("EMAIL", 999L);

        verify(notifyQueueRepository).save(queueCaptor.capture());
        NotifyQueue savedQueue = queueCaptor.getValue();
        assertThat(savedQueue.getMaxRetry()).isEqualTo(1);
    }

    @Test
    void publish_callsRepositoryOnce() {
        when(notifyQueueScanProperties.getMaxRetry()).thenReturn(3);

        notifyQueuePublisher.publish("EMAIL", 999L);
        verify(notifyQueueRepository, times(1)).save(any(NotifyQueue.class));
    }
}
