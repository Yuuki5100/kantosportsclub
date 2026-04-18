package com.example.servercommon.setting;

import java.time.Instant;
import java.util.Iterator;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class SystemSettingCache {

    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final SystemSettingCacheProperties properties;

    public SystemSettingCache(SystemSettingCacheProperties properties) {
        this.properties = properties;
    }

    public Optional<String> get(String key) {
        if (!properties.isEnabled() || key == null) {
            return Optional.empty();
        }

        CacheEntry entry = cache.get(key);
        if (entry == null) {
            return Optional.empty();
        }

        if (entry.isExpired()) {
            cache.remove(key, entry);
            return Optional.empty();
        }

        return Optional.ofNullable(entry.value());
    }

    public void put(String key, String value) {
        if (!properties.isEnabled() || key == null) {
            return;
        }

        int maxEntries = properties.getMaxEntries();
        if (maxEntries > 0 && cache.size() >= maxEntries) {
            evictOne();
        }

        long ttlSeconds = properties.getTtlSeconds();
        Instant expiresAt = (ttlSeconds <= 0)
                ? Instant.MAX
                : Instant.now().plusSeconds(ttlSeconds);

        cache.put(key, new CacheEntry(value, expiresAt));
    }

    public void evict(String key) {
        if (key == null) {
            return;
        }
        cache.remove(key);
    }

    public void evictAll() {
        cache.clear();
    }

    private void evictOne() {
        Iterator<String> iterator = cache.keySet().iterator();
        if (iterator.hasNext()) {
            cache.remove(iterator.next());
        }
    }

    private record CacheEntry(String value, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }
}
