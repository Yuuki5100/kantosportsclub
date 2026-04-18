package com.example.appserver.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "security.authorization")
public class AuthorizationModeProperties {

    /**
     * 旧 AuthorizationInterceptor 経路を有効化するか。
     * false の場合は @RequirePermission 経路を標準として利用する。
     */
    private boolean legacyInterceptorEnabled = false;
}
