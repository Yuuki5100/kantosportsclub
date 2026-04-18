package com.example.servercommon.response.batchresult;

import java.time.LocalDateTime;

import org.joda.time.DateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Service layer用のバッチ結果リスト
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseListQueryResult {
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
