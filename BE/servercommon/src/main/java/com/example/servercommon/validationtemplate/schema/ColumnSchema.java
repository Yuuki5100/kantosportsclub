package com.example.servercommon.validationtemplate.schema;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

import com.example.servercommon.validationtemplate.rule.dynamic.ContextBasedRequiredRule;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
public class ColumnSchema {

    /** アップロードファイル上のカラム名（ヘッダー） */
    private String name;

    /** Javaエンティティ内のフィールド名 */
    private String field;

    /** 必須項目かどうか */
    private boolean required = false;

    /** 最大文字数（null許容） */
    private Integer maxLength;

    /** 正規表現による形式検証 */
    private String pattern;

    /** 許可される値（enum等） */
    private List<String> enumValues;

    /** 型定義（例: string, int, date など。将来拡張用） */
    private String type;

    /** エラーメッセージ */
    private String validationMessage;

    /** 対応するDBのテーブル */
    private String repository;

    /** 対応するエンティティのクラス名 */
    private String entity;

    /** 必須条件を動的に判定するクラス名（RowBasedRequiredRule または ContextBasedRequiredRule 実装） */
    private String dynamicRequiredRule;
}
