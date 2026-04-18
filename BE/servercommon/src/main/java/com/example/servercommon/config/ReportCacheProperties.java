package com.example.servercommon.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@ConfigurationProperties(prefix = "report.cache")
public class ReportCacheProperties {
    /**
     * キャッシュを有効にするかどうか（application.yml で制御）
     */
    private boolean enabled = false;
}
