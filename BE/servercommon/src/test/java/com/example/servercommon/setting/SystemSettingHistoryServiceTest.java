package com.example.servercommon.setting;

import com.example.servercommon.model.SystemSetting;
import com.example.servercommon.model.SystemSettingHistory;
import com.example.servercommon.repository.SystemSettingHistoryRepository;
import java.lang.reflect.Proxy;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SystemSettingHistoryServiceTest {

    @Test
    void recordChanges_shouldSaveOnlyChangedKeys() {
        AtomicReference<List<SystemSettingHistory>> savedHolder = new AtomicReference<>();
        SystemSettingHistoryRepository repository = newRepository(savedHolder);
        SystemSettingHistoryService historyService = new SystemSettingHistoryService(repository);

        SystemSetting before = new SystemSetting();
        before.setId("1");
        before.setNumberOfRetries(3);
        before.setNumberOfNotices(10);

        SystemSetting after = new SystemSetting();
        after.setId("1");
        after.setNumberOfRetries(5);
        after.setNumberOfNotices(10);

        historyService.recordChanges(before, after, "u1", LocalDateTime.of(2026, 4, 2, 10, 0));

        List<SystemSettingHistory> saved = savedHolder.get();
        assertThat(saved).isNotNull();
        assertThat(saved).hasSize(1);
        assertThat(saved.get(0).getSettingKey()).isEqualTo(SystemSettingKeys.NUMBER_OF_RETRIES);
        assertThat(saved.get(0).getBeforeValue()).isEqualTo("3");
        assertThat(saved.get(0).getAfterValue()).isEqualTo("5");
        assertThat(saved.get(0).getUpdatedBy()).isEqualTo("u1");
    }

    @Test
    void recordChanges_shouldSkipWhenNoDiff() {
        AtomicReference<List<SystemSettingHistory>> savedHolder = new AtomicReference<>();
        SystemSettingHistoryRepository repository = newRepository(savedHolder);
        SystemSettingHistoryService historyService = new SystemSettingHistoryService(repository);

        SystemSetting before = new SystemSetting();
        before.setId("1");
        before.setNumberOfRetries(3);

        SystemSetting after = new SystemSetting();
        after.setId("1");
        after.setNumberOfRetries(3);

        historyService.recordChanges(before, after, "u1", LocalDateTime.now());

        assertThat(savedHolder.get()).isNull();
    }

    @SuppressWarnings("unchecked")
    private SystemSettingHistoryRepository newRepository(AtomicReference<List<SystemSettingHistory>> savedHolder) {
        return (SystemSettingHistoryRepository) Proxy.newProxyInstance(
                SystemSettingHistoryRepository.class.getClassLoader(),
                new Class[]{SystemSettingHistoryRepository.class},
                (proxy, method, args) -> {
                    if ("saveAll".equals(method.getName())) {
                        savedHolder.set((List<SystemSettingHistory>) args[0]);
                        return args[0];
                    }
                    throw new UnsupportedOperationException("Unsupported method: " + method.getName());
                }
        );
    }
}
