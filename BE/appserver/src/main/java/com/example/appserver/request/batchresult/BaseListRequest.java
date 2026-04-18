package com.example.appserver.request.batchresult;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * バッチ結果一覧リクエストモデル
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseListRequest {

    /**
     * 拠点
     */
    private String base;

    /**
     * バッチ
     */
    private String batch;

    /**
     * 実行開始日
     */
    private String startDate;

    /**
     * ページ番号
     */
    private int pageNo;

    /**
     * ページ毎件数
     */
    private int pageSize;

    /**
     * ソートキー
     */
    private String sortKey;

    /**
     * ソート順
     */
    private String sortOrder;

    /**
     * 拠点完全一致フラグ
     */
    private boolean baseExtMatFlag;

    /**
     * バッチ完全一致フラグ
     */
    private boolean batchExtMatFlag;

}
