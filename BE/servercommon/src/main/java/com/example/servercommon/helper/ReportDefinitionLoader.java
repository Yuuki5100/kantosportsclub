package com.example.servercommon.helper;

import com.example.servercommon.config.ReportCacheProperties;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.ReportDefinition;
import com.example.servercommon.model.ReportLayout;
import com.example.servercommon.model.ReportMaster;
import com.example.servercommon.repository.ReportLayoutRepository;
import com.example.servercommon.repository.ReportMasterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReportDefinitionLoader {

    private final ReportMasterRepository reportMasterRepository;
    private final ReportLayoutRepository reportLayoutRepository;
    private final ReportCacheProperties cacheProperties;

    private final ConcurrentHashMap<Long, ReportDefinition> cache = new ConcurrentHashMap<>();

    public ReportDefinition load(Long reportId) {
        if (cacheProperties.isEnabled()) {
            return cache.computeIfAbsent(reportId, this::loadFromDatabase);
        } else {
            return loadFromDatabase(reportId);
        }
    }

    public void reload(Long reportId) {
        if (cacheProperties.isEnabled()) {
            cache.remove(reportId);
            log.info(BackendMessageCatalog.LOG_REPORT_DEFINITION_CACHE_CLEARED, reportId);
        }
    }
    public boolean isCacheEnabled() {
        return cacheProperties.isEnabled();
    }

    private ReportDefinition loadFromDatabase(Long reportId) {
        ReportMaster reportMaster = reportMasterRepository.findByReportId(reportId);
        if (reportMaster == null) {
            throw new IllegalArgumentException(BackendMessageCatalog.format(BackendMessageCatalog.EX_REPORT_NOT_FOUND, reportId));
        }

        List<ReportLayout> layoutList = reportLayoutRepository.findByReportId(reportId);
        if (layoutList == null || layoutList.isEmpty()) {
            throw new IllegalArgumentException(BackendMessageCatalog.format(BackendMessageCatalog.EX_REPORT_LAYOUT_NOT_FOUND, reportId));
        }

        return new ReportDefinition(reportMaster, layoutList);
    }


}
