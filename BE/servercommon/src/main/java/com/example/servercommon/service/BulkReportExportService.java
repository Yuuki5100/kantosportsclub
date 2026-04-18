package com.example.servercommon.service;

import com.example.servercommon.request.report.BulkExportRequest;

public interface BulkReportExportService {
    public String exportBulk(BulkExportRequest request);
}
