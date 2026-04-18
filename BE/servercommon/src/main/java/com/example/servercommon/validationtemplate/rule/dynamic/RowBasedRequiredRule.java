package com.example.servercommon.validationtemplate.rule.dynamic;

import java.util.Map;

public interface RowBasedRequiredRule {
    /**
     * 1行のデータに基づいて、該当列が必須かどうかを判定する。
     *
     * @param row 該当行のデータ（列名→値）
     * @return true: 必須, false: 任意
     */
    boolean isRequired(Map<String, String> row);
}
