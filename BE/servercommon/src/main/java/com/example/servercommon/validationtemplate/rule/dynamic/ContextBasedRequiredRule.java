package com.example.servercommon.validationtemplate.rule.dynamic;

import java.util.List;
import java.util.Map;

public interface ContextBasedRequiredRule {
    /**
     * 全体データを初期化時に受け取り、以降の行判定で参照可能にする。
     *
     * @param allRows ファイル全体のデータ（行ごとに Map）
     */
    void init(List<Map<String, String>> allRows);

    /**
     * 単一行の情報に基づいて必須かどうかを判定。
     *
     * @param row 該当行
     * @return true: 必須, false: 任意
     */
    boolean isRequired(Map<String, String> row);
}
