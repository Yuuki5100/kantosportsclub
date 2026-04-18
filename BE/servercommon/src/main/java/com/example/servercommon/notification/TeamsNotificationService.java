package com.example.servercommon.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class TeamsNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(TeamsNotificationService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String teamsWebhookUrl;

    public TeamsNotificationService(
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            @Value("${teams.webhook.url}") String teamsWebhookUrl
    ) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.teamsWebhookUrl = teamsWebhookUrl;
    }

    public void sendNotification(String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String payload = objectMapper.writeValueAsString(Map.of("text", message));
            HttpEntity<String> request = new HttpEntity<>(payload, headers);

            restTemplate.postForEntity(teamsWebhookUrl, request, String.class);

            logger.info("✅ Teams通知送信成功: {}", message);
        } catch (HttpStatusCodeException e) {
            logger.error("❌ Teams通知失敗: HTTPステータス={}, レスポンスボディ={}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            logger.error("❌ Teams通知で予期せぬ例外発生: {}", e.getMessage(), e);
        }
    }
}
