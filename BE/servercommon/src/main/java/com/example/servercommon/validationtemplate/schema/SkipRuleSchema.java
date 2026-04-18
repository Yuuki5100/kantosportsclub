package com.example.servercommon.validationtemplate.schema;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * YAMLファイル内で定義されるスキップルールの情報を保持するクラス。
 *
 * - className: スキップ判定を行うクラスの完全修飾名
 * - param: スキップ判定の条件に使用するパラメータ（例: 特定のカラム名）
 *
 * このクラスはTemplateSchemaに組み込まれ、YAMLから自動的にマッピングされる。
 */
public class SkipRuleSchema {
    private String className;
    private String param;

    @JsonProperty("class")
    public String getClassName() {
        return className;
    }

    @JsonProperty("class")
    public void setClassName(String className) {
        this.className = className;
    }

    public String getParam() {
        return param;
    }

    public void setParam(String param) {
        this.param = param;
    }
}
