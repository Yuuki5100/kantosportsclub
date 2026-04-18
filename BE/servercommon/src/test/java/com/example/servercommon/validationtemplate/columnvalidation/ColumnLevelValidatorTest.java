package com.example.servercommon.validationtemplate.columnvalidation;

import com.example.servercommon.validationtemplate.rule.ValidationResult;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ColumnLevelValidatorTest {

    private ColumnLevelValidator validator;

    @BeforeEach
    void setUp() {
        // 簡易モック実装
        validator = new ColumnLevelValidator() {
            @Override
            public void validate(List<Map<String, String>> rows, TemplateSchema schema, List<ValidationResult> results) {
                // row の数だけ ValidationResult を作る
                for (int i = 0; i < rows.size(); i++) {
                    results.add(new ValidationResult(i + 1));
                }
            }
        };
    }

    @Test
    void validate_v1_addsValidationResults() {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(Map.of("col1", "value1"));
        rows.add(Map.of("col1", "value2"));

        List<ValidationResult> results = new ArrayList<>();
        TemplateSchema schema = new TemplateSchema();

        validator.validate(rows, schema, results);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getRowNumber()).isEqualTo(1);
        assertThat(results.get(1).getRowNumber()).isEqualTo(2);
    }

    @Test
    void validate_v2_defaultMethod_callsV1() {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(Map.of("col1", "value1"));

        List<ValidationResult> results = new ArrayList<>();

        // ColumnSchema インスタンスを作って name をセット
        ColumnSchema colSchema = new ColumnSchema();
        colSchema.setName("col1");
        List<ColumnSchema> columns = List.of(colSchema);

        validator.validate(rows, columns, results);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getRowNumber()).isEqualTo(1);
    }


    @Test
    void validate_emptyRows_doesNothing() {
        List<Map<String, String>> rows = new ArrayList<>();
        List<ValidationResult> results = new ArrayList<>();
        TemplateSchema schema = new TemplateSchema();

        validator.validate(rows, schema, results);

        assertThat(results).isEmpty();
    }
}

