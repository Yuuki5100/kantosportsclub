package com.example.servercommon.model.base;

import lombok.Data;

@Data
public class CommonAbstractBaseCondition {
    /**
     * ページ番号
     */
    private Integer pageNo;

    /**
     * ページ毎件数
     */
    private Integer pageSize;

    /**
     * ソートキー
     */
    private String sortKey;

    /**
     * ソート順
     */
    private String sortOrder;
}
