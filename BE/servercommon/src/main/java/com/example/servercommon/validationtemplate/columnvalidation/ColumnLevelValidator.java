package com.example.servercommon.validationtemplate.columnvalidation;

import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import com.example.servercommon.validationtemplate.rule.ValidationResult;

import java.util.List;
import java.util.Map;

public interface ColumnLevelValidator {

    // 既存（v1対応）
    void validate(List<Map<String, String>> rows, TemplateSchema schema, List<ValidationResult> results);

    // 新規追加（v2対応）
    default void validate(List<Map<String, String>> rows, List<ColumnSchema> columns, List<ValidationResult> results) {
        TemplateSchema dummy = new TemplateSchema();
        dummy.setColumns(columns);
        validate(rows, dummy, results);
    }
}
