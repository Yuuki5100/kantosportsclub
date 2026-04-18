package com.example.servercommon.validationtemplate.columnvalidation;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.rule.ValidationResult;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;

@Component
public class HeaderFormatValidator implements ColumnLevelValidator {

    private final ErrorCodeService errorCodeService;
    private static final String DEFAULT_LOCALE = "ja";

    public HeaderFormatValidator(ErrorCodeService errorCodeService) {
        this.errorCodeService = errorCodeService;
    }

    @Override
    public void validate(List<Map<String, String>> rows, TemplateSchema schema, List<ValidationResult> results) {
        if (rows.isEmpty()) return;
        Set<String> actualHeaders = rows.get(0).keySet();
        List<ColumnSchema> columnSchemas = schema.getColumns();

        List<String> expectedHeaders = columnSchemas.stream()
                .map(ColumnSchema::getField)
                .toList();

        // 必須カラムの存在チェック
        for (ColumnSchema column : columnSchemas) {
            if (column.isRequired() && !actualHeaders.contains(column.getField())) {
                ValidationResult result = new ValidationResult(0);
                String message = errorCodeService.getErrorMessage("E9001", List.of(column.getField()), DEFAULT_LOCALE);
                result.addError(column.getField(), message);
                results.add(result);
            }
        }

        // 予期しないカラムの存在チェック
        for (String actual : actualHeaders) {
            if (!expectedHeaders.contains(actual)) {
                ValidationResult result = new ValidationResult(0);
                String message = errorCodeService.getErrorMessage("E9002", List.of(actual), DEFAULT_LOCALE);
                result.addError(actual, message);
                results.add(result);
            }
        }
    }
}
