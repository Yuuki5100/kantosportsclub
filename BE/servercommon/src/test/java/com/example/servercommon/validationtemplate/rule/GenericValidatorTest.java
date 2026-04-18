package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GenericValidatorTest {

    private ErrorCodeService errorCodeService;
    private GenericValidator validator;

    @BeforeEach
    void setup() {
        errorCodeService = mock(ErrorCodeService.class);
        when(errorCodeService.getErrorMessage(anyString(), anyString()))
            .thenAnswer(inv -> inv.getArgument(0));
        when(errorCodeService.getErrorMessage(anyString(), anyList(), anyString()))
            .thenAnswer(inv -> inv.getArgument(0));
        validator = new GenericValidator(errorCodeService);
    }

    @Test
    void 正常なデータはバリデーションエラーなし() {
        TemplateSchema schema = new TemplateSchema();
        schema.setTemplateId("users");
        schema.setVersion("v1");

        ColumnSchema nameCol = new ColumnSchema();
        nameCol.setName("username");
        nameCol.setField("username");
        nameCol.setRequired(true);
        nameCol.setMaxLength(20);

        ColumnSchema emailCol = new ColumnSchema();
        emailCol.setName("email");
        emailCol.setField("email");
        emailCol.setRequired(true);
        emailCol.setPattern(".+@.+");

        schema.setColumns(List.of(nameCol, emailCol));

        List<Map<String, String>> rows = List.of(
            Map.of("username", "Alice", "email", "alice@example.com"),
            Map.of("username", "Bob", "email", "bob@example.com")
        );

        List<ValidationResult> results = validator.validate(rows, schema);

        assertEquals(2, results.size());
        assertTrue(results.get(0).isValid());
        assertTrue(results.get(1).isValid());
    }

    @Test
    void 異常なデータはバリデーションエラーを返す() {
        TemplateSchema schema = new TemplateSchema();
        schema.setTemplateId("users");
        schema.setVersion("v1");

        ColumnSchema nameCol = new ColumnSchema();
        nameCol.setName("username");
        nameCol.setField("username");
        nameCol.setRequired(true);
        nameCol.setMaxLength(10);

        ColumnSchema emailCol = new ColumnSchema();
        emailCol.setName("email");
        emailCol.setField("email");
        emailCol.setRequired(true);
        emailCol.setPattern(".+@.+");

        schema.setColumns(List.of(nameCol, emailCol));

        List<Map<String, String>> rows = List.of(
            Map.of("username", "", "email", "invalidemail")
        );

        List<ValidationResult> results = validator.validate(rows, schema);

        assertEquals(1, results.size());
        ValidationResult result = results.get(0);
        assertFalse(result.isValid());
        assertEquals(2, result.getErrors().size());

        Set<String> errorFields = result.getErrors().stream()
            .map(ValidationResult.ValidationError::getField)
            .collect(Collectors.toSet());

        assertTrue(errorFields.contains("username"));
        assertTrue(errorFields.contains("email"));
    }

    @Test
    void roleがGUESTならemailは任意になりUSERなら必須エラーになる() {
        TemplateSchema schema = new TemplateSchema();
        schema.setTemplateId("users");
        schema.setVersion("v1");

        ColumnSchema roleCol = new ColumnSchema();
        roleCol.setName("role");
        roleCol.setField("role");
        roleCol.setRequired(true);
        roleCol.setEnumValues(List.of("USER", "GUEST"));

        ColumnSchema emailCol = new ColumnSchema();
        emailCol.setName("email");
        emailCol.setField("email");
        emailCol.setRequired(false); // default not required
        emailCol.setDynamicRequiredRule(
            "com.example.servercommon.validationtemplate.rule.RequireEmailUnlessGuest"
        );
        emailCol.setPattern(".+@.+");

        schema.setColumns(List.of(roleCol, emailCol));

        List<Map<String, String>> rows = List.of(
            Map.of("role", "GUEST", "email", ""),                 // OK
            Map.of("role", "USER", "email", ""),                  // エラー
            Map.of("role", "USER", "email", "john@example.com")   // OK
        );

        List<ValidationResult> results = validator.validate(rows, schema);

        assertEquals(3, results.size());
        assertTrue(results.get(0).isValid());
        assertFalse(results.get(1).isValid());
        assertTrue(results.get(2).isValid());
    }
}
