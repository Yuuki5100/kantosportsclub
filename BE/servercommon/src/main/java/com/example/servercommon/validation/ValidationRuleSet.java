package com.example.servercommon.validation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 各フィールドに対するバリデーションルールを管理するクラス
 * - 入力値に対するルール（形式、必須、長さなど）
 * - DBに対するルール（存在チェック、ユニークチェックなど）
 */
public class ValidationRuleSet {

    // 入力値に対するバリデーションルールのマップ（フィールド名 -> ルールリスト）
    private final Map<String, List<CommonInputValidationRule>> inputRules = new HashMap<>();

    // DBに対するバリデーションルールのマップ（フィールド名 -> ルールリスト）
    private final Map<String, List<DbCommonValidationRule>> dbRules = new HashMap<>();

    /**
     * 入力値バリデーションルールを追加
     * @param fieldName 対象フィールド名
     * @param rule バリデーションルール
     */
    public void addInputRule(String fieldName, CommonInputValidationRule rule) {
        inputRules.computeIfAbsent(fieldName, k -> new ArrayList<>()).add(rule);
    }

    /**
     * DBバリデーションルールを追加
     * @param fieldName 対象フィールド名
     * @param rule バリデーションルール
     */
    public void addDbRule(String fieldName, DbCommonValidationRule rule) {
        dbRules.computeIfAbsent(fieldName, k -> new ArrayList<>()).add(rule);
    }

    /**
     * 入力マップに対して登録済みの全バリデーションルールを適用し、エラー結果を返却
     * @param inputValues ユーザー入力マップ（フィールド名 -> 値）
     * @return エラーがあった場合の ValidationResult リスト（問題なければ空）
     */
    public List<ValidationResult<?>> validate(Map<String, Object> inputValues) {
        List<ValidationResult<?>> results = new ArrayList<>();

        // 入力値バリデーションの実行
        for (Map.Entry<String, List<CommonInputValidationRule>> entry : inputRules.entrySet()) {
            String fieldName = entry.getKey();
            Object value = inputValues.get(fieldName);
            for (CommonInputValidationRule rule : entry.getValue()) {
                ValidationResult<?> result = rule.validate(fieldName, value);
                if (!result.isValid()) {
                    results.add(result);
                }
            }
        }

        // DBバリデーションの実行
        for (Map.Entry<String, List<DbCommonValidationRule>> entry : dbRules.entrySet()) {
            String fieldName = entry.getKey();
            Object value = inputValues.get(fieldName);
            for (DbCommonValidationRule rule : entry.getValue()) {
                ValidationResult<?> result = rule.validate(fieldName, value);
                if (!result.isValid()) {
                    results.add(result);
                }
            }
        }

        return results;
    }
}
