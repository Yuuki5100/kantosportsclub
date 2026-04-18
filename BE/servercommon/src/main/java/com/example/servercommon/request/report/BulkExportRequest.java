package com.example.servercommon.request.report;

import lombok.Data;
import java.util.List;

@Data
public class BulkExportRequest {
    private List<Long> reportIds;
    private String outputFormat; // "pdf" or "excel"
    private String fileNamePrefix; // 任意
}
