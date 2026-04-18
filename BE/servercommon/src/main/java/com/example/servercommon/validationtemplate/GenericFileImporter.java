package com.example.servercommon.validationtemplate;

import com.example.servercommon.exception.FileImportException;
import com.example.servercommon.message.BackendMessageCatalog;

import com.example.servercommon.utils.SkipRuleFactory;
import com.example.servercommon.validationtemplate.loader.TemplateSchemaLoader;
import com.example.servercommon.validationtemplate.mapper.GenericEntityMapper;
import com.example.servercommon.validationtemplate.reader.FileRecordReaderDispatcher;
import com.example.servercommon.validationtemplate.repository.RepositoryResolver;
import com.example.servercommon.validationtemplate.rule.GenericValidator;
import com.example.servercommon.validationtemplate.rule.SkipRule;
import com.example.servercommon.validationtemplate.rule.ValidationResult;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.validationtemplate.schema.SkipRuleSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSheetSchema;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class GenericFileImporter {

    @Autowired
    private final TemplateSchemaLoader schemaLoader;
    @Autowired
    private final FileRecordReaderDispatcher readerDispatcher;
    @Autowired
    private final GenericValidator validator;
    @Autowired
    private final GenericEntityMapper entityMapper;
    @Autowired
    private final RepositoryResolver repositoryResolver;

    public <T> List<ValidationResult> importFiles(
            Map<String, TemplateSchema> yamlData,
            String templateId,
            String filename,
            InputStream is) throws ClassNotFoundException {

        log.info(BackendMessageCatalog.LOG_FILE_IMPORT_START, templateId, filename);
        List<ValidationResult> allResults = new ArrayList<>();

        TemplateSchema schema;
        try {
            schema = schemaLoader.load(templateId);
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_TEMPLATE_LOAD_FAILED, templateId, e);
            throw new FileImportException(BackendMessageCatalog.format(BackendMessageCatalog.EX_TEMPLATE_LOAD_FAILED, templateId), e);
        }

        // ストリームの準備に必要
        byte[] fileBytes = null;
        try {
            fileBytes = is.readAllBytes();
        } catch (IOException e) {
            throw new RuntimeException(BackendMessageCatalog.EX_STREAM_READ_FAILED, e);
        }

        try {
            if (schema.isMultiSheet()) {
                for (TemplateSheetSchema sheet : schema.getSheets()) {
                    log.info(BackendMessageCatalog.LOG_SHEET_LOADING, sheet.getSheetName());
                    // ストリーム生成の準備
                    InputStream sheetStream = new ByteArrayInputStream(fileBytes);
                    // シート読み込み
                    List<Map<String, String>> records = readerDispatcher.readSheet(filename, sheet.getSheetName(),
                            sheetStream);
                    SkipRuleSchema skipRuleSchema = schema.getSkipRule();
                    List<Map<String, String>> filteredRecords = new ArrayList<>();
                    if (skipRuleSchema != null) {
                        SkipRule rule = SkipRuleFactory.create(skipRuleSchema.getClassName(),
                                skipRuleSchema.getParam());
                        for (Map<String, String> record : records) {
                            if (!rule.shouldSkip(record)) {
                                filteredRecords.add(record);
                            }
                        }
                    } else {
                        filteredRecords = records;
                    }

                    List<ValidationResult> results = validator.validate(filteredRecords, sheet.getColumns());
                    allResults.addAll(results);

                    Map<String, List<ColumnSchema>> grouped = sheet.getColumns().stream()
                            .collect(Collectors.groupingBy(ColumnSchema::getEntity));

                    for (String entity : grouped.keySet()) {
                        List<Map<String, String>> filtered = summarize(filteredRecords, grouped.get(entity));
                        saveIfValid(results, filtered, entity, sheet.getColumns());
                    }
                }
            } else {
                InputStream sheetStream = new ByteArrayInputStream(fileBytes);
                List<Map<String, String>> records = readerDispatcher.read(filename, sheetStream);
                SkipRuleSchema skipRuleSchema = schema.getSkipRule();
                List<Map<String, String>> filteredRecords = new ArrayList<>();
                if (skipRuleSchema != null) {
                    SkipRule rule = SkipRuleFactory.create(skipRuleSchema.getClassName(),
                            skipRuleSchema.getParam());
                    for (Map<String, String> record : records) {
                        if (!rule.shouldSkip(record)) {
                            filteredRecords.add(record);
                        }
                    }
                } else {
                    filteredRecords = records;
                }
                List<ValidationResult> results = validator.validate(filteredRecords, schema);
                allResults.addAll(results);

                List<ColumnSchema> columns = yamlData.get(templateId).getColumns();
                Map<String, List<ColumnSchema>> grouped = columns.stream()
                        .collect(Collectors.groupingBy(ColumnSchema::getEntity));

                for (String entity : grouped.keySet()) {
                    List<Map<String, String>> filtered = summarize(filteredRecords, grouped.get(entity));
                    saveIfValid(results, filtered, entity, columns);
                }
            }

            log.info(BackendMessageCatalog.LOG_FILE_IMPORT_COMPLETED, allResults.stream().filter(r -> !r.isValid()).count());
            return allResults;

        } catch (FileImportException e) {
            throw e; // 既存例外はそのまま再スロー
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_FILE_IMPORT_UNEXPECTED_ERROR, e);
            throw new FileImportException(BackendMessageCatalog.EX_FILE_PROCESSING_FAILED, e);
        }
    }

    private List<Map<String, String>> summarize(List<Map<String, String>> records, List<ColumnSchema> columns) {
        return records.stream().map(record -> {
            Map<String, String> partial = new HashMap<>();
            for (ColumnSchema column : columns) {
                partial.put(column.getField(), record.get(column.getField()));
            }
            return partial;
        }).collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private void saveIfValid(List<ValidationResult> results, List<Map<String, String>> data,
            String entityClassName, List<ColumnSchema> columnSchemas) throws ClassNotFoundException {
        if (results.stream().anyMatch(r -> !r.isValid())) {
            log.warn(BackendMessageCatalog.LOG_SKIP_ENTITY_SAVE_BY_VALIDATION, entityClassName);
            return;
        }

        try {
            Class<?> clazz = Class.forName(entityClassName);
            List<?> entities = entityMapper.map(data, columnSchemas, clazz);
            Object repository = repositoryResolver.resolveRepository(columnSchemas);
            saveAll(repository, entities);
            log.info(BackendMessageCatalog.LOG_ENTITY_SAVE_SUCCESS, entities.size(), clazz.getSimpleName());
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_ENTITY_SAVE_FAILED, entityClassName, e);
            throw new FileImportException(BackendMessageCatalog.format(BackendMessageCatalog.EX_ENTITY_SAVE_FAILED, entityClassName), e);
        }
    }

    @Transactional
    @SuppressWarnings("unchecked")
    private <T> void saveAll(Object repository, List<T> entities) {
        try {
            repository.getClass()
                    .getMethod("saveAll", Iterable.class)
                    .invoke(repository, entities);
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_REPOSITORY_SAVE_FAILED, e);
            throw new FileImportException(BackendMessageCatalog.EX_REPOSITORY_SAVE_FAILED, e);
        }
    }
}
