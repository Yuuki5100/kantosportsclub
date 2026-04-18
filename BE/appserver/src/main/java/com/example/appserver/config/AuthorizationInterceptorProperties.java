package com.example.appserver.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "security.allowlist")
public class AuthorizationInterceptorProperties {

    /**
     * 認可チェックを適用しないパス。
     */
    private List<String> paths = new ArrayList<>(List.of(
            "/api/auth/login",
            "/api/user/reset-password/**",
            "/api/user/forgot-password",
            "/error",
            "/ws/**",
            "/favicon.ico",
            "/import/**",
            "/oauth/authorize",
            "/oauth/token",
            "/callback",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    ));

    public List<String> getPaths() {
        return paths;
    }

    public void setPaths(List<String> paths) {
        this.paths = paths;
    }

    /**
     * 既存呼び出し互換のために残す。
     */
    public List<String> getExcludePaths() {
        return paths;
    }

    /**
     * 既存呼び出し互換のために残す。
     */
    public void setExcludePaths(List<String> excludePaths) {
        this.paths = excludePaths;
    }
}
