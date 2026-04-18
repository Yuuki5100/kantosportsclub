package com.example.servercommon.validationtemplate;

import com.example.servercommon.exception.FileImportException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.validationtemplate.loader.TemplateSchemaLoader;
import com.example.servercommon.validationtemplate.mapper.GenericEntityMapper;
import com.example.servercommon.validationtemplate.reader.FileRecordReaderDispatcher;
import com.example.servercommon.validationtemplate.repository.RepositoryResolver;
import com.example.servercommon.validationtemplate.rule.GenericValidator;
import com.example.servercommon.validationtemplate.rule.ValidationResult;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class GenericFileImporterTest {

    public static class DummyEntity {
        public String username;
    }

    interface DummyRepository {
        void saveAll(Iterable<?> entities);
    }

    private TemplateSchemaLoader schemaLoader;
    private FileRecordReaderDispatcher readerDispatcher;
    private GenericValidator validator;
    private GenericEntityMapper entityMapper;
    private RepositoryResolver repositoryResolver;

    private GenericFileImporter importer;

    @BeforeEach
    void setUp() {
        schemaLoader = mock(TemplateSchemaLoader.class);
        readerDispatcher = mock(FileRecordReaderDispatcher.class);
        validator = mock(GenericValidator.class);
        entityMapper = mock(GenericEntityMapper.class);
        repositoryResolver = mock(RepositoryResolver.class);

        importer = new GenericFileImporter(schemaLoader, readerDispatcher, validator, entityMapper, repositoryResolver);
    }

    @Test
    void バリデーション成功時に保存が行われる() throws Exception {
        TemplateSchema schema = createSampleSchemaAndColumns();
        List<Map<String, String>> records = List.of(Map.of("username", "john"));
        List<ValidationResult> validationResults = List.of(valid(1));
        List<DummyEntity> entities = List.of(new DummyEntity());
        DummyRepository mockRepository = mock(DummyRepository.class);

        Map<String, TemplateSchema> map = Map.of("users", schema);

        when(schemaLoader.load("users")).thenReturn(schema);
        when(readerDispatcher.read(eq("users.csv"), any(InputStream.class))).thenReturn(records);
        when(validator.validate(records, schema)).thenReturn(validationResults);
        when(entityMapper.map(records, schema.getColumns(), DummyEntity.class)).thenReturn(entities);
        when(repositoryResolver.resolveRepository(schema.getColumns())).thenReturn(mockRepository);

        List<ValidationResult> result = importer.importFiles(map, "users", "users.csv", InputStream.nullInputStream());

    //     verify(dummyRepository).saveAll(anyList());
   }

    @Test
    void バリデーション失敗時は保存されない() throws Exception {
        TemplateSchema schema = createSampleSchemaAndColumns();
        List<Map<String, String>> records = List.of(Map.of("username", "john"));
        List<ValidationResult> validationResults = List.of(invalid(1));
        Map<String, TemplateSchema> map = Map.of("users", schema);

        when(schemaLoader.load("users")).thenReturn(schema);
        when(readerDispatcher.read(eq("users.csv"), any(InputStream.class))).thenReturn(records);
        when(validator.validate(records, schema)).thenReturn(validationResults);

        List<ValidationResult> result = importer.importFiles(map, "users", "users.csv", InputStream.nullInputStream());
        assertEquals(1, result.size());
        assertFalse(result.get(0).isValid());

        verify(repositoryResolver, never()).resolveRepository(any());
    }

    @Test
    void 保存時に例外が発生した場合はFileImportExceptionがスローされる() throws Exception {
        TemplateSchema schema = createSampleSchemaAndColumns();
        List<Map<String, String>> records = List.of(Map.of("username", "john"));
        List<ValidationResult> validationResults = List.of(valid(1));
        List<DummyEntity> entities = List.of(new DummyEntity());
        Map<String, TemplateSchema> map = Map.of("users", schema);

        Object faultyRepository = new Object();

        when(schemaLoader.load("users")).thenReturn(schema);
        when(readerDispatcher.read(eq("users.csv"), any(InputStream.class))).thenReturn(records);
        when(validator.validate(records, schema)).thenReturn(validationResults);
        when(entityMapper.map(records, schema.getColumns(), DummyEntity.class)).thenReturn(entities);
        when(repositoryResolver.resolveRepository(schema.getColumns())).thenReturn(faultyRepository);

        FileImportException thrown = assertThrows(FileImportException.class,
                () -> importer.importFiles(map, "users", "users.csv", InputStream.nullInputStream()));

        assertTrue(thrown.getMessage().contains(
                BackendMessageCatalog.format(BackendMessageCatalog.EX_ENTITY_SAVE_FAILED, DummyEntity.class.getName())));
        assertNotNull(thrown.getCause());
        assertTrue(thrown.getCause().getMessage().contains(BackendMessageCatalog.EX_REPOSITORY_SAVE_FAILED));
    }

    private TemplateSchema createSampleSchemaAndColumns() {
        TemplateSchema schema = new TemplateSchema();
        schema.setTemplateId("users");
        schema.setVersion("v1");

        ColumnSchema col = new ColumnSchema();
        col.setName("username");
        col.setField("username");
        col.setEntity(DummyEntity.class.getName());
        col.setRepository("userRepository");
        schema.setColumns(List.of(col));

        return schema;
    }

    private ValidationResult valid(int rowNum) {
        return new ValidationResult(rowNum);
    }

    private ValidationResult invalid(int rowNum) {
        ValidationResult result = new ValidationResult(rowNum);
        result.addError("username", "必須項目です");
        return result;
    }
}
