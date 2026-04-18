package com.example.appserver.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "notify.queue.scan")
public class NotifyQueueScanProperties {

    private int limit = 100;
    private long fixedDelayMs = 10_000_000L;
    private int maxRetry = 5;
    private long backoffInitialDelayMs = 1_000L;
    private double backoffMultiplier = 2.0d;
    private long backoffMaxDelayMs = 60_000L;
}
