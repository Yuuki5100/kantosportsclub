package com.example.servercommon.model;

import com.example.servercommon.model.base.CommonAbstractBaseCondition;

import lombok.Data;

/**
 * バッチ一覧のパラメタ
 */
@Data
public class BaseListParam extends CommonAbstractBaseCondition{

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
     * 拠点完全一致フラグ
     */
    private boolean baseExtMatFlag;

    /**
     * バッチ完全一致フラグ
     */
    private boolean batchExtMatFlag;

}

