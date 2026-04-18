package com.example.servercommon.utils;

import java.util.List;

import com.example.servercommon.validationtemplate.rule.ValidationResult;

/**
 * ValidationResultUtils
 *
 * バリデーション結果（ValidationResult）のエラー情報を整形・抽出するユーティリティクラス。
 * 主にアップロード時のバリデーションエラーをメッセージリストに変換して、
 * コントローラー層でAPIレスポンスに含めるために使用される。
 */
public class ValidationResultUtils {
    /**
     * バリデーションエラーを含む行の情報を整形して、メッセージリストとして返却する。
     * 各行ごとに「Row <行番号>: <フィールド名> - <エラーメッセージ>」の形式で出力される。
     *
     * @param results バリデーション結果リスト
     * @return エラーメッセージ文字列のリスト
     */
    public static List<String> extractErrorMessages(List<ValidationResult> results) {
        return results.stream()
            .filter(r -> !r.isValid())
            .flatMap(r -> r.getErrors().stream()
                .map(err -> "Row " + r.getRowNumber() + ": " + err.getField() + " - " + err.getMessage()))
            .toList();
    }
}
