package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.utils.FileExecUtils;
import com.example.servercommon.validationtemplate.columnvalidation.ColumnLevelValidator;
import com.example.servercommon.validationtemplate.columnvalidation.HeaderFormatValidator;
import com.example.servercommon.validationtemplate.rule.dynamic.ContextBasedRequiredRule;
import com.example.servercommon.validationtemplate.rule.dynamic.RowBasedRequiredRule;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
public class GenericValidator {

    private final ErrorCodeService errorCodeService;

    private final List<ValidationRule> rules;
    private final List<ColumnLevelValidator> columnValidators;



    /**
     * デフォルトコンストラクタ：rules と columnValidators を errorCodeService 付きで初期化
     */
    @Autowired
    public GenericValidator(ErrorCodeService errorCodeService) {
        this.errorCodeService = errorCodeService;
        this.rules = ValidationRuleRegistry.getDefaultRules(errorCodeService);
        this.columnValidators = List.of(new HeaderFormatValidator(errorCodeService));
    }

    // TemplateSchemaベースの検証
    public List<ValidationResult> validate(List<Map<String, String>> rows, TemplateSchema schema) {
        return validate(rows, schema.getColumns());
    }

    // ColumnSchemaベースの検証
    public List<ValidationResult> validate(List<Map<String, String>> rows, List<ColumnSchema> columns) {
        List<ValidationResult> results = new ArrayList<>();

        Map<String, ColumnSchema> columnMap = columns.stream()
                .collect(Collectors.toMap(ColumnSchema::getName, c -> c, (a, b) -> a, LinkedHashMap::new));

        Map<String, Object> dynamicRuleMap = prepareDynamicRequiredRules(columns, rows);

        // ヘッダーチェック
        for (ColumnLevelValidator validator : columnValidators) {
            validator.validate(rows, columns, results);
        }

        for (int i = 0; i < rows.size(); i++) {
            Map<String, String> row = rows.get(i);
            if (FileExecUtils.fileEmptyRowsSkip(row)) {
                continue;
            }

            ValidationResult result = new ValidationResult(i + 1);

            for (Map.Entry<String, ColumnSchema> entry : columnMap.entrySet()) {
                String columnName = entry.getKey();
                ColumnSchema columnSchema = entry.getValue();

                if (!row.containsKey(columnName)) {
                    continue;
                }

                String value = row.getOrDefault(columnName, "");
                boolean required = resolveRequired(columnSchema, row, dynamicRuleMap);

                // 必須チェック（動的／静的）
                if (required) {
                    new RequiredRule(errorCodeService, true).validate(columnName, value, columnSchema, result);
                }

                // その他バリデーション
                for (ValidationRule rule : rules) {
                    if (rule instanceof RequiredRule) continue; // RequiredRule は上で別途処理
                    rule.validate(columnName, value, columnSchema, result);
                }
            }

            results.add(result);
        }

        return results;
    }

    // 必須チェック条件の決定（動的ルールが優先）
    private boolean resolveRequired(ColumnSchema columnSchema, Map<String, String> row, Map<String, Object> dynamicRuleMap) {
        Object rule = dynamicRuleMap.get(columnSchema.getField());
        if (rule instanceof ContextBasedRequiredRule context) {
            return context.isRequired(row);
        } else if (rule instanceof RowBasedRequiredRule rowRule) {
            return rowRule.isRequired(row);
        }
        return Boolean.TRUE.equals(columnSchema.isRequired());
    }

    // dynamicRequiredRule の初期化
    private Map<String, Object> prepareDynamicRequiredRules(List<ColumnSchema> columns, List<Map<String, String>> rows) {
        Map<String, Object> dynamicRules = new HashMap<>();

        for (ColumnSchema column : columns) {
            String ruleClassName = column.getDynamicRequiredRule();
            if (ruleClassName == null || ruleClassName.isEmpty()) continue;

            try {
                Class<?> clazz = Class.forName(ruleClassName);

                if (ContextBasedRequiredRule.class.isAssignableFrom(clazz)) {
                    ContextBasedRequiredRule contextRule = (ContextBasedRequiredRule) clazz.getDeclaredConstructor().newInstance();
                    contextRule.init(rows);
                    dynamicRules.put(column.getField(), contextRule);
                } else if (RowBasedRequiredRule.class.isAssignableFrom(clazz)) {
                    RowBasedRequiredRule rowRule = (RowBasedRequiredRule) clazz.getDeclaredConstructor().newInstance();
                    dynamicRules.put(column.getField(), rowRule);
                } else {
                    throw new IllegalArgumentException(BackendMessageCatalog.format(
                            BackendMessageCatalog.EX_UNSUPPORTED_DYNAMIC_REQUIRED_RULE, ruleClassName));
                }
            } catch (Exception e) {
                throw new RuntimeException(BackendMessageCatalog.format(
                        BackendMessageCatalog.EX_DYNAMIC_REQUIRED_RULE_INSTANTIATE_FAILED, ruleClassName), e);
            }
        }

        return dynamicRules;
    }
}
