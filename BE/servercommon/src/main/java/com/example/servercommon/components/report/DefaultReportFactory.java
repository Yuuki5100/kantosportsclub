package com.example.servercommon.components.report;

import jp.co.systembase.report.Report;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class DefaultReportFactory implements ReportFactory {
    @Override
    public Report create(Map<String, Object> templateJson) {
        return new Report(templateJson);
    }
}
