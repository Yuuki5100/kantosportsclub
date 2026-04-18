package com.example.servercommon.service.reports;

import java.util.List;

public interface ReportEntityFetcher {
    boolean supports(Long reportId);
    List<?> fetchEntities(Long reportId);
}

