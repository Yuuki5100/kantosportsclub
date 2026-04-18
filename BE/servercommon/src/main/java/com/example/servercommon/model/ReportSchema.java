package com.example.servercommon.model;

import lombok.Data;
import java.util.List;

@Data
public class ReportSchema {
    private String reportId;
    private List<ReportFieldSchema> mappings;
}
