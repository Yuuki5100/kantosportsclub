package com.example.appserver.service;

import com.example.servercommon.responseModel.NotifyQueueEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebSocketNotificationServiceTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private WebSocketNotificationService webSocketNotificationService;

    private NotifyQueueEvent mockEvent;

    @BeforeEach
    void setUp() {
        mockEvent = new NotifyQueueEvent();
        // 必要に応じてモックデータ設定
        // mockEvent.setType("gate_in");
        // mockEvent.setMessage("Test message");
    }

    @Test
    void testNotifyByType_SendsToCorrectTopic() {
        String eventType = "gate_in";

        webSocketNotificationService.notifyByType(eventType, mockEvent);

        verify(messagingTemplate, times(1))
                .convertAndSend("/topic/notify/gate_in", mockEvent);
    }

    @Test
    void testNotifyByType_LowercasesEventType() {
        String eventType = "REPORT_READY";

        webSocketNotificationService.notifyByType(eventType, mockEvent);

        verify(messagingTemplate, times(1))
                .convertAndSend("/topic/notify/report_ready", mockEvent);
    }

    @Test
    void testNotifyGeneral_SendsToGeneralTopic() {
        webSocketNotificationService.notifyGeneral(mockEvent);

        verify(messagingTemplate, times(1))
                .convertAndSend("/topic/notify", mockEvent);
    }

    @Test
    void testNotifyByType_ThrowsWhenEventTypeBlank() {
        assertThatThrownBy(() -> webSocketNotificationService.notifyByType("   ", mockEvent))
                .isInstanceOf(IllegalArgumentException.class);

        verifyNoInteractions(messagingTemplate);
    }
}
