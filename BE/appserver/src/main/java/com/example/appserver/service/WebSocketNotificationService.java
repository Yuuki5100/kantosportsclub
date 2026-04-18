package com.example.appserver.service;

import com.example.servercommon.enums.NotifyEventType;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.NotifyQueueEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 通知イベントタイプに応じてトピックを分けて送信する
     * 例: /topic/notify/gate_in, /topic/notify/report_ready
     */
    public void notifyByType(String eventType, NotifyQueueEvent payload) {
        String normalizedEventType = normalizeEventType(eventType);
        if (NotifyEventType.fromValue(normalizedEventType).isEmpty()) {
            log.warn(BackendMessageCatalog.LOG_NOTIFY_UNKNOWN_EVENT_TYPE, eventType);
        }

        String topic = "/topic/notify/" + normalizedEventType.toLowerCase(Locale.ROOT);
        messagingTemplate.convertAndSend(topic, payload);
    }

    /**
     * 汎用トピック (/topic/notify) に送る場合はこちらを使用
     */
    public void notifyGeneral(NotifyQueueEvent payload) {
        messagingTemplate.convertAndSend("/topic/notify", payload);
    }

    private String normalizeEventType(String eventType) {
        if (!StringUtils.hasText(eventType)) {
            throw new IllegalArgumentException(BackendMessageCatalog.EX_NOTIFY_EVENT_TYPE_REQUIRED);
        }
        return eventType.trim();
    }
}
