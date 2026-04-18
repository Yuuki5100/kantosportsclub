package com.example.servercommon.model;

import jakarta.persistence.*;
import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="report_master")
public class ReportMaster {
    @Id
    private Long reportId;
    // 帳票名
    private String reportName;
    // テンプレートファイルパス
    private String templateFile;
    // アウトプットフォーマット
    private Integer outputFormat;
    // 説明
    private String description;
    private Timestamp updatedAt;
    private String updatedBy;
}
