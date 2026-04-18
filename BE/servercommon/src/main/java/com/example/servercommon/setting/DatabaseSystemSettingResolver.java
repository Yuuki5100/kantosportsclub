package com.example.servercommon.setting;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.SystemSetting;
import com.example.servercommon.repository.SystemSettingRepository;
import java.time.Duration;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DatabaseSystemSettingResolver implements SystemSettingResolver {

    private static final String SYSTEM_SETTING_ID = "1";

    private final SystemSettingRepository systemSettingRepository;
    private final SystemSettingCache cache;
    private final SystemSettingValueConverter valueConverter;

    public DatabaseSystemSettingResolver(SystemSettingRepository systemSettingRepository,
                                         SystemSettingCache cache,
                                         SystemSettingValueConverter valueConverter) {
        this.systemSettingRepository = systemSettingRepository;
        this.cache = cache;
        this.valueConverter = valueConverter;
    }

    @Override
    public Optional<String> getString(String key) {
        if (key == null || key.isBlank()) {
            return Optional.empty();
        }

        Optional<String> cached = cache.get(key);
        if (cached.isPresent()) {
            log.debug(BackendMessageCatalog.LOG_SYSTEM_SETTING_CACHE_HIT, key);
            return cached;
        }

        Optional<String> loaded = loadFromDatabase(key);
        loaded.ifPresent(value -> cache.put(key, value));
        if (loaded.isPresent()) {
            log.debug(BackendMessageCatalog.LOG_SYSTEM_SETTING_CACHE_MISS, key);
        }
        return loaded;
    }

    @Override
    public String getOrDefault(String key, String defaultValue) {
        return getString(key).orElse(defaultValue);
    }

    @Override
    public Optional<Integer> getInt(String key) {
        return get(key, Integer.class);
    }

    @Override
    public Integer getIntOrDefault(String key, Integer defaultValue) {
        return getInt(key).orElse(defaultValue);
    }

    @Override
    public Optional<Long> getLong(String key) {
        return get(key, Long.class);
    }

    @Override
    public Long getLongOrDefault(String key, Long defaultValue) {
        return getLong(key).orElse(defaultValue);
    }

    @Override
    public Optional<Boolean> getBoolean(String key) {
        return get(key, Boolean.class);
    }

    @Override
    public Boolean getBooleanOrDefault(String key, Boolean defaultValue) {
        return getBoolean(key).orElse(defaultValue);
    }

    @Override
    public Optional<Duration> getDuration(String key) {
        return get(key, Duration.class);
    }

    @Override
    public Duration getDurationOrDefault(String key, Duration defaultValue) {
        return getDuration(key).orElse(defaultValue);
    }

    @Override
    public <T> Optional<T> get(String key, Class<T> targetType) {
        return getString(key).map(value -> valueConverter.convert(key, value, targetType));
    }

    @Override
    public void evict(String key) {
        cache.evict(key);
        log.debug(BackendMessageCatalog.LOG_SYSTEM_SETTING_CACHE_EVICT, key);
    }

    @Override
    public void evictAll() {
        cache.evictAll();
        log.debug(BackendMessageCatalog.LOG_SYSTEM_SETTING_CACHE_EVICT_ALL);
    }

    private Optional<String> loadFromDatabase(String key) {
        Optional<SystemSetting> current = systemSettingRepository.findById(SYSTEM_SETTING_ID);
        if (current.isEmpty()) {
            log.warn(BackendMessageCatalog.LOG_SYSTEM_SETTING_ROW_NOT_FOUND, SYSTEM_SETTING_ID);
            return Optional.empty();
        }

        Optional<String> resolved = SystemSettingValueMapper.resolve(current.get(), key);
        if (resolved.isEmpty()) {
            log.warn(BackendMessageCatalog.LOG_SYSTEM_SETTING_KEY_NOT_FOUND, key);
        }
        return resolved;
    }
}
