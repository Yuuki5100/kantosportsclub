package com.example.appserver.request.notification;

import com.example.appserver.request.notification.NotifyRequest;

import lombok.Data;

@Data
public class NotifyRequest {
    private String eventType;
    private Long refId;
}
