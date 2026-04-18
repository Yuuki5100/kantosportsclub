package com.example.servercommon.setting;

import com.example.servercommon.model.SystemSetting;
import com.example.servercommon.model.SystemSettingHistory;
import com.example.servercommon.repository.SystemSettingHistoryRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class SystemSettingHistoryService {

    private final SystemSettingHistoryRepository historyRepository;

    public SystemSettingHistoryService(SystemSettingHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public void recordChanges(SystemSetting before,
                              SystemSetting after,
                              String updatedBy,
                              LocalDateTime updatedDateTime) {
        if (after == null) {
            return;
        }

        Map<String, String> beforeValues = SystemSettingValueMapper.toMap(before);
        Map<String, String> afterValues = SystemSettingValueMapper.toMap(after);

        Set<String> keys = new LinkedHashSet<>();
        keys.addAll(afterValues.keySet());
        keys.addAll(beforeValues.keySet());

        List<SystemSettingHistory> rows = new ArrayList<>();
        for (String key : keys) {
            String beforeValue = beforeValues.get(key);
            String afterValue = afterValues.get(key);
            if (Objects.equals(beforeValue, afterValue)) {
                continue;
            }

            SystemSettingHistory history = new SystemSettingHistory();
            history.setSettingId(after.getId());
            history.setSettingKey(key);
            history.setBeforeValue(beforeValue);
            history.setAfterValue(afterValue);
            history.setUpdatedBy(updatedBy);
            history.setUpdatedDateTime(updatedDateTime != null ? updatedDateTime : LocalDateTime.now());
            rows.add(history);
        }

        if (!rows.isEmpty()) {
            historyRepository.saveAll(rows);
        }
    }
}
