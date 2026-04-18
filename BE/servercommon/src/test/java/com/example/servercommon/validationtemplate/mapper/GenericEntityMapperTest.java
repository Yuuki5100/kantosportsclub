package com.example.servercommon.validationtemplate.mapper;

import com.example.servercommon.exception.FileImportException;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class GenericEntityMapperTest {

    public static class MockEntity {
        public String name;
        public Integer age;
        public boolean active;
        public Role role;
    }

    public enum Role {
        USER, ADMIN
    }

    public static class UnsupportedEntity {
        public LocalDate birthDate;
    }

    private boolean hasCause(Throwable ex, Class<?> target) {
        while (ex != null) {
            if (target.isInstance(ex))
                return true;
            ex = ex.getCause();
        }
        return false;
    }

    private TemplateSchema createSchema() {
        ColumnSchema name = new ColumnSchema();
        name.setName("name");
        name.setField("name");

        ColumnSchema age = new ColumnSchema();
        age.setName("age");
        age.setField("age");

        ColumnSchema active = new ColumnSchema();
        active.setName("active");
        active.setField("active");

        ColumnSchema role = new ColumnSchema();
        role.setName("role");
        role.setField("role");

        TemplateSchema schema = new TemplateSchema();
        schema.setColumns(List.of(name, age, active, role));
        return schema;
    }

    @Test
    void 正常なマッピングが行われる() {
        TemplateSchema schema = createSchema();
        List<Map<String, String>> rows = List.of(Map.of(
                "name", "Alice",
                "age", "30",
                "active", "true",
                "role", "ADMIN"));

        List<MockEntity> mapped = new GenericEntityMapper().map(rows, schema.getColumns(), MockEntity.class);

        assertEquals(1, mapped.size());
        MockEntity entity = mapped.get(0);
        assertEquals("Alice", entity.name);
        assertEquals(30, entity.age);
        assertTrue(entity.active);
        assertEquals(Role.ADMIN, entity.role);
    }

    @Test
    void 空文字やnullはフィールドに設定されない() {
        TemplateSchema schema = createSchema();

        Map<String, String> row = new HashMap<>();
        row.put("name", "");
        row.put("age", null);
        row.put("active", "false");
        row.put("role", "USER");

        List<MockEntity> mapped = new GenericEntityMapper().map(List.of(row), schema.getColumns(), MockEntity.class);
        MockEntity entity = mapped.get(0);
        assertNull(entity.name);
        assertNull(entity.age);
        assertFalse(entity.active);
        assertEquals(Role.USER, entity.role);
    }

    @Test
    void 存在しないフィールド名を指定すると例外が発生する() {
        TemplateSchema schema = createSchema();
        schema.getColumns().get(0).setField("nonexistent");

        List<Map<String, String>> rows = List.of(Map.of("name", "Alice"));

        FileImportException ex = assertThrows(FileImportException.class,
                () -> new GenericEntityMapper().map(rows, schema.getColumns(), MockEntity.class));
        assertTrue(ex.getMessage().contains("フィールド変換失敗"));
    }

    @Test
    void 未対応の型を指定すると例外が発生する() {
        ColumnSchema col = new ColumnSchema();
        col.setName("birthDate");
        col.setField("birthDate");

        TemplateSchema schema = new TemplateSchema();
        schema.setColumns(List.of(col));

        // convertValue() の直接テスト
        GenericEntityMapper mapper = new GenericEntityMapper();

        assertThrows(FileImportException.class, () -> mapper.map(List.of(Map.of("birthDate", "2024-01-01")),
                schema.getColumns(), UnsupportedEntity.class));
    }
}
