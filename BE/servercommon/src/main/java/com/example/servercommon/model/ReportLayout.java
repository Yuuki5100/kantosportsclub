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
@IdClass(ReportLayoutId.class) // 複合キー
@Table(name="report_layout")
public class ReportLayout {

    @Id
    private Long reportId;

    @Id
    private Integer columnId;

    @Column(name = "column_name")
    private String culumnName;

    // 新構成: エンティティ名とプロパティパス
    private String entityName;    // Order, User など（将来使わないなら省略も可）
    private String propertyPath;  // user.name や product.category.name

    // 表示定義
    private String displayLabel;
    private Integer dataType;
    private Integer displayOrder;
    private Integer visibleFlag;
    private String formatPattern;
    private Integer requiredFlag;
    private String defaultValue;
    private String remarks;

    private Timestamp updatedAt;
    private String updatedBy;
}

