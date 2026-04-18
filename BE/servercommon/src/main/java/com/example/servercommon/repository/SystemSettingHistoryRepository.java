package com.example.servercommon.repository;

import com.example.servercommon.model.SystemSettingHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingHistoryRepository extends JpaRepository<SystemSettingHistory, Long> {

    List<SystemSettingHistory> findTop100BySettingIdOrderByUpdatedDateTimeDesc(String settingId);
}
