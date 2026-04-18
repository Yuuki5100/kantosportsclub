package com.example.servercommon.setting;

import com.example.servercommon.model.SystemSetting;
import com.example.servercommon.repository.SystemSettingRepository;
import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DatabaseSystemSettingResolverTest {

    private AtomicInteger findByIdCount;
    private AtomicReference<SystemSetting> currentSetting;
    private DatabaseSystemSettingResolver resolver;

    @BeforeEach
    void setUp() {
        findByIdCount = new AtomicInteger(0);
        currentSetting = new AtomicReference<>();

        SystemSettingRepository repository = (SystemSettingRepository) Proxy.newProxyInstance(
                SystemSettingRepository.class.getClassLoader(),
                new Class[]{SystemSettingRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName())) {
                        findByIdCount.incrementAndGet();
                        return Optional.ofNullable(currentSetting.get());
                    }
                    throw new UnsupportedOperationException("Unsupported method: " + method.getName());
                }
        );

        SystemSettingCacheProperties properties = new SystemSettingCacheProperties();
        properties.setEnabled(true);
        properties.setTtlSeconds(300);
        properties.setMaxEntries(32);

        resolver = new DatabaseSystemSettingResolver(
                repository,
                new SystemSettingCache(properties),
                new SystemSettingValueConverter()
        );
    }

    @Test
    void getInt_shouldUseCacheAfterFirstLoad() {
        SystemSetting setting = new SystemSetting();
        setting.setId("1");
        setting.setNumberOfNotices(7);
        currentSetting.set(setting);

        assertThat(resolver.getInt(SystemSettingKeys.NUMBER_OF_NOTICES)).contains(7);
        assertThat(resolver.getInt(SystemSettingKeys.NUMBER_OF_NOTICES)).contains(7);
        assertThat(findByIdCount.get()).isEqualTo(1);
    }

    @Test
    void getInt_shouldSupportLegacyAliasKey() {
        SystemSetting setting = new SystemSetting();
        setting.setId("1");
        setting.setNumberOfNotices(5);
        currentSetting.set(setting);

        assertThat(resolver.getInt(SystemSettingKeys.NOTICE_DISPLAY_LIMIT)).contains(5);
    }

    @Test
    void evict_shouldForceReload() {
        SystemSetting first = new SystemSetting();
        first.setId("1");
        first.setNumberOfRetries(3);
        currentSetting.set(first);

        assertThat(resolver.getInt(SystemSettingKeys.NUMBER_OF_RETRIES)).contains(3);

        SystemSetting second = new SystemSetting();
        second.setId("1");
        second.setNumberOfRetries(9);
        currentSetting.set(second);

        resolver.evict(SystemSettingKeys.NUMBER_OF_RETRIES);
        assertThat(resolver.getInt(SystemSettingKeys.NUMBER_OF_RETRIES)).contains(9);
        assertThat(findByIdCount.get()).isEqualTo(2);
    }
}
