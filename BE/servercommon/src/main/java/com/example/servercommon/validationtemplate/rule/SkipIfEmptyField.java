package com.example.servercommon.validationtemplate.rule;

import java.util.Map;

/**
 * 指定されたカラム（フィールド）の値が空である場合に、その行をスキップ対象とするルール。
 *
 * このルールは .yml ファイルで skipRule として定義し、該当フィールド名をパラメータとして指定することで適用される。
 */
public class SkipIfEmptyField implements SkipRule {

    private final String targetField;

    public SkipIfEmptyField(String targetField) {
        this.targetField = targetField;
    }

    @Override
    public boolean shouldSkip(Map<String, String> row) {
        String value = row.get(targetField);
        return value == null || value.trim().isEmpty();
    }

}
