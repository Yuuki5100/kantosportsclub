package com.example.appserver.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "sync.remote")
public class SyncRemoteProperties {

    private String baseUrl;
    private Notice notice = new Notice();

    @Getter
    @Setter
    public static class Notice {
        private String noticeChangedPath = "/api/notice/sync";
    }
}
