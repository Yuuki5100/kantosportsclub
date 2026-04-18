package com.example.servercommon.setting;

import java.time.Duration;
import java.util.Optional;

public interface SystemSettingResolver {

    Optional<String> getString(String key);

    String getOrDefault(String key, String defaultValue);

    Optional<Integer> getInt(String key);

    Integer getIntOrDefault(String key, Integer defaultValue);

    Optional<Long> getLong(String key);

    Long getLongOrDefault(String key, Long defaultValue);

    Optional<Boolean> getBoolean(String key);

    Boolean getBooleanOrDefault(String key, Boolean defaultValue);

    Optional<Duration> getDuration(String key);

    Duration getDurationOrDefault(String key, Duration defaultValue);

    <T> Optional<T> get(String key, Class<T> targetType);

    void evict(String key);

    void evictAll();
}
