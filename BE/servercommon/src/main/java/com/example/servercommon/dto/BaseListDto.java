package com.example.servercommon.dto;

import java.time.LocalDateTime;

import lombok.Data;

/**
 * バッチ結果DTO (DB layer の使用)
 */
@Data
public class BaseListDto {
    /**
     * 拠点CD
     */
    private String baseCd;

    /**
     * 拠点名
     */
    private String baseName;

    /**
     * バッチ名
     */
    private String batchName;

    /**
     * 実行開始日時
     */
    private LocalDateTime startDateAndTime;

    /**
     * 実行終了日時
     */
    private LocalDateTime endDateAndTime;

    /**
     * ステータス名
     */
    private String statusName;

    /**
     * エラー内容
     */
    private String errorMessege;
}
