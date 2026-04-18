package com.example.appserver.service;

import com.example.servercommon.enums.NotifyEventType;

public interface NotifyQueuePublisher {

    void publish(String eventType, Long refId);

    default void publish(NotifyEventType eventType, Long refId) {
        publish(eventType.value(), refId);
    }
}
