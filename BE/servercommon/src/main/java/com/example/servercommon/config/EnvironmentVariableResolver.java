package com.example.servercommon.config;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.example.servercommon.message.BackendMessageCatalog;

import lombok.Data;
import lombok.RequiredArgsConstructor;

/**
 * 環境変数や application.yml の設定値を取得するためのユーティリティクラスです。
 * <p>
 * プロパティの解決は以下の順序で行われます：
 * </p>
 * 環境変数 → application.yml / .properties → メソッドで渡されたデフォルト値
 */
@Component
@RequiredArgsConstructor
@Data
public class EnvironmentVariableResolver {
    private final Environment environment;
    private static final Logger logger = LoggerFactory.getLogger(EnvironmentVariableResolver.class);

    public Optional<String> getOptional(String key) {
        return Optional.ofNullable(environment.getProperty(key));
    }

    public String getOrDefault(String key, String defaultValue) {
        return environment.getProperty(key, defaultValue);
    }

    public Integer getInt(String key, Integer defaultValue) {
        return getSafeProperty(key, Integer.class, defaultValue);
    }

    public Boolean getBoolean(String key, Boolean defaultValue) {
        return getSafeProperty(key, Boolean.class, defaultValue);
    }

    public Double getDouble(String key, Double defaultValue) {
        return getSafeProperty(key, Double.class, defaultValue);
    }

    private <T> T getSafeProperty(String key, Class<T> targetType, T defaultValue) {
        try {
            return environment.getProperty(key, targetType, defaultValue);
        } catch (Exception e) {
            logger.warn(BackendMessageCatalog.LOG_ENV_RESOLVE_DEFAULT, key, targetType.getSimpleName(), e);
            return defaultValue;
        }
    }
}
