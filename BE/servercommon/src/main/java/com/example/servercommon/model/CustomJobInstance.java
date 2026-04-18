package com.example.servercommon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Spring Batch のデフォルトの JOB_INSTANCE テーブルに新たなカラム（ERROR_DISPLAY_TYPE）を追加したため、
 * 本クラスはそのテーブルに対応するサンプルエンティティとして定義しています。
 *
 * Spring Batch の標準モデルでは新カラムが扱えないため、独自にエンティティを定義し、
 * データの登録・取得に対応できるようにしています。
 */
@Entity
@Table(name = "BATCH_JOB_INSTANCE")
@Data
public class CustomJobInstance {

    @Id
    @Column(name = "JOB_INSTANCE_ID")
    private Long jobInstanceId;

    @Column(name = "VERSION")
    private Long version;

    @Column(name = "JOB_NAME")
    private String jobName;

    @Column(name = "JOB_KEY")
    private String jobKey;

    @Column(name = "ERROR_DISPLAY_TYPE")
    private String errorDisplayType;
}
