package com.example.servercommon.components.report;

import jp.co.systembase.report.Report;
import java.util.Map;

public interface ReportFactory {
    Report create(Map<String, Object> templateJson);
}
