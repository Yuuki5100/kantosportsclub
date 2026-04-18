package com.example.appserver.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "security.permission")
public class PermissionProperties {

    /**
     * 権限設定キャッシュ再読込間隔(ms)。0以下で定期再読込無効。
     */
    private long cacheRefreshFixedDelayMs = 0L;

    /**
     * Method Security 補助経路で、未定義エンドポイントを許可するか。
     */
    private boolean methodSecurityAllowIfUnmapped = true;

    /**
     * Method Security 補助経路で HTTP メソッドが省略された場合の既定値。
     */
    private String methodSecurityDefaultMethod = "GET";
}
