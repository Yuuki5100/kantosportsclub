package com.example.servercommon.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class TeamsNotificationServiceTest {

    private RestTemplate restTemplate;
    private TeamsNotificationService service;

    private final String testWebhookUrl = "https://dummy-webhook.teams.local/webhook-url";

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        ObjectMapper objectMapper = new ObjectMapper();
        service = new TeamsNotificationService(restTemplate, objectMapper, testWebhookUrl);
    }

    @Test
    void sendNotification_正常送信されること() {
        String testMessage = "Test message";

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>("OK", HttpStatus.OK));

        service.sendNotification(testMessage);

        ArgumentCaptor<HttpEntity<String>> requestCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(eq(testWebhookUrl), requestCaptor.capture(), eq(String.class));

        HttpEntity<String> request = requestCaptor.getValue();
        assertNotNull(request);
        assertTrue(request.getBody().contains("Test message")); // JSONの中に含まれていることを確認
    }

    @Test
    void sendNotification_通知失敗しても例外をスローしない() {
        String testMessage = "This will fail";

        doThrow(new RuntimeException("Webhook unreachable"))
                .when(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(String.class));

        // 実行しても例外は上がってこない（ログ出力のみ）
        assertDoesNotThrow(() -> service.sendNotification(testMessage));
    }
}
