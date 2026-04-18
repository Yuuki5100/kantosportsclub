package com.example.servercommon.model;

import java.io.File;
import java.util.List;

public class ReportDefinition {
    private final ReportMaster reportMaster;
    private final List<ReportLayout> layoutList;

    public ReportDefinition(ReportMaster reportMaster, List<ReportLayout> layoutList) {
        this.reportMaster = reportMaster;
        this.layoutList = layoutList;
    }

    public ReportMaster getReportMaster() {
        return reportMaster;
    }

    public List<ReportLayout> getLayoutList() {
        return layoutList;
    }
}
