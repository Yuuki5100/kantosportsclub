package com.example.appserver.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "async.job")
public class AsyncJobProperties {

    private long statusTtlMinutes = 60L;
    private long cleanupFixedDelayMs = 600000L;
    private int cleanupBatchSize = 100;
    private String artifactPrefix = "async-jobs";
}

