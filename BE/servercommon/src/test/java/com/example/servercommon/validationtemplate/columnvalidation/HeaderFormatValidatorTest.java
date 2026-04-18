package com.example.servercommon.validationtemplate.columnvalidation;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.rule.ValidationResult;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class HeaderFormatValidatorTest {

    private ErrorCodeService errorCodeService;
    private HeaderFormatValidator validator;

    @BeforeEach
    void setUp() {
        errorCodeService = mock(ErrorCodeService.class);
        validator = new HeaderFormatValidator(errorCodeService);
    }

    @Test
    void validate_noErrors_whenHeadersMatch() {
        ColumnSchema col1 = new ColumnSchema();
        col1.setField("col1");
        col1.setRequired(true);

        ColumnSchema col2 = new ColumnSchema();
        col2.setField("col2");
        col2.setRequired(true);

        TemplateSchema schema = new TemplateSchema();
        schema.setColumns(List.of(col1, col2));

        Map<String, String> row = Map.of("col1", "val1", "col2", "val2");
        List<Map<String, String>> rows = List.of(row);

        List<ValidationResult> results = new ArrayList<>();
        validator.validate(rows, schema, results);

        assertThat(results).isEmpty();
    }

    @Test
    void validate_addsError_whenRequiredColumnMissing() {
        ColumnSchema col1 = new ColumnSchema();
        col1.setField("col1");
        col1.setRequired(true);

        ColumnSchema col2 = new ColumnSchema();
        col2.setField("col2");
        col2.setRequired(true);

        TemplateSchema schema = new TemplateSchema();
        schema.setColumns(List.of(col1, col2));

        Map<String, String> row = Map.of("col1", "val1"); // col2 missing
        List<Map<String, String>> rows = List.of(row);

        when(errorCodeService.getErrorMessage(eq("E9001"), eq(List.of("col2")), eq("ja")))
                .thenReturn("Missing required column col2");

        List<ValidationResult> results = new ArrayList<>();
        validator.validate(rows, schema, results);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getErrors())
                .anySatisfy(e -> {
                    assertThat(e.getField()).isEqualTo("col2");
                    assertThat(e.getMessage()).isEqualTo("Missing required column col2");
                });
    }

    @Test
    void validate_addsError_whenUnexpectedColumnPresent() {
        ColumnSchema col1 = new ColumnSchema();
        col1.setField("col1");
        col1.setRequired(true);

        TemplateSchema schema = new TemplateSchema();
        schema.setColumns(List.of(col1));

        Map<String, String> row = Map.of("col1", "val1", "unexpected", "val2");
        List<Map<String, String>> rows = List.of(row);

        when(errorCodeService.getErrorMessage(eq("E9002"), eq(List.of("unexpected")), eq("ja")))
                .thenReturn("Unexpected column unexpected");

        List<ValidationResult> results = new ArrayList<>();
        validator.validate(rows, schema, results);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getErrors())
                .anySatisfy(e -> {
                    assertThat(e.getField()).isEqualTo("unexpected");
                    assertThat(e.getMessage()).isEqualTo("Unexpected column unexpected");
                });
    }

    @Test
    void validate_addsMultipleErrors_whenMultipleIssues() {
        ColumnSchema col1 = new ColumnSchema();
        col1.setField("col1");
        col1.setRequired(true);

        ColumnSchema col2 = new ColumnSchema();
        col2.setField("col2");
        col2.setRequired(true);

        TemplateSchema schema = new TemplateSchema();
        schema.setColumns(List.of(col1, col2));

        Map<String, String> row = Map.of("col1", "val1", "unexpected", "val2");
        List<Map<String, String>> rows = List.of(row);

        when(errorCodeService.getErrorMessage(eq("E9001"), eq(List.of("col2")), eq("ja")))
                .thenReturn("Missing required column col2");
        when(errorCodeService.getErrorMessage(eq("E9002"), eq(List.of("unexpected")), eq("ja")))
                .thenReturn("Unexpected column unexpected");

        List<ValidationResult> results = new ArrayList<>();
        validator.validate(rows, schema, results);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getErrors().get(0).getMessage()).isEqualTo("Missing required column col2");
        assertThat(results.get(1).getErrors().get(0).getMessage()).isEqualTo("Unexpected column unexpected");
    }

    @Test
    void validate_noErrors_whenRowsEmpty() {
        TemplateSchema schema = new TemplateSchema();
        schema.setColumns(Collections.emptyList());

        List<ValidationResult> results = new ArrayList<>();
        validator.validate(Collections.emptyList(), schema, results);

        assertThat(results).isEmpty();
    }
}
