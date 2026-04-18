package com.example.appserver.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "sync.outbox")
public class SyncOutboxProperties {

    private boolean use = true;
    private int maxRetry = 10;
    private long fixedDelayMs = 60000L;
    private int dispatchLimit = 100;
}
