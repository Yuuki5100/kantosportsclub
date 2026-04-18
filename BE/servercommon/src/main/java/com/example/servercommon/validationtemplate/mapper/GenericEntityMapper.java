package com.example.servercommon.validationtemplate.mapper;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.example.servercommon.utils.FileExecUtils;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.exception.FileImportException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.ReportFieldSchema;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class GenericEntityMapper {

    public <T> List<T> map(List<Map<String, String>> records, List<ColumnSchema> columns, Class<T> clazz) {
        List<T> entities = new ArrayList<>();

        try {
            for (Map<String, String> row : records) {
                if (FileExecUtils.fileEmptyRowsSkip(row))
                    continue;

                T instance = clazz.getDeclaredConstructor().newInstance();

                for (ColumnSchema column : columns) {
                    String value = row.get(column.getName());
                    String fieldName = column.getField();

                    if (value == null || value.isBlank())
                        continue;

                    try {
                        Object cvValue = FileExecUtils.valueConverter(fieldName, value);
                        Field field = clazz.getDeclaredField(fieldName);
                        field.setAccessible(true);
                        Object converted = convertValue(cvValue.toString(), field.getType());
                        field.set(instance, converted);
                    } catch (Exception fe) {
                        log.error(BackendMessageCatalog.LOG_FIELD_CONVERSION_FAILED, clazz.getName(), fieldName, value, fe);
                        throw new FileImportException(BackendMessageCatalog.format(
                                BackendMessageCatalog.EX_FIELD_CONVERSION_FAILED, fieldName, value), fe);
                    }
                }

                entities.add(instance);
            }
        } catch (FileImportException fie) {
            throw fie; // 既に捕捉済みなら再スロー
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_ENTITY_CREATION_FAILED, clazz.getName(), e);
            throw new FileImportException(BackendMessageCatalog.format(
                    BackendMessageCatalog.EX_ENTITY_CONVERSION_FAILED, clazz.getName()), e);
        }

        return entities;
    }

    // インスタンス生成だけをするクラス。引数にエンティティの相対パスを指定してください。
    public Object createEmptyEntityInstancesByClassName(String entityClassName) {
        List<Object> instances = new ArrayList<>();

        try {
            Class<?> clazz = Class.forName(entityClassName);
            Object instance = clazz.getDeclaredConstructor().newInstance();
            instances.add(instance);

        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_ENTITY_CREATION_FAILED, entityClassName, e);
            throw new FileImportException(BackendMessageCatalog.format(
                    BackendMessageCatalog.EX_ENTITY_INSTANCE_CREATE_FAILED, entityClassName), e);
        }

        return instances;
    }

    @SuppressWarnings("unchecked")
    private Object convertValue(String value, Class<?> type) {
        if (type == String.class)
            return value;
        if (type == Integer.class || type == int.class)
            return Integer.parseInt(value);
        if (type == Long.class || type == long.class)
            return Long.parseLong(value);
        if (type == Double.class || type == double.class)
            return Double.parseDouble(value);
        if (type == Boolean.class || type == boolean.class)
            return Boolean.parseBoolean(value);
        if (type == BigDecimal.class)
            return new BigDecimal(value);
        if (type == Date.class)
            return Date.valueOf(value);
        if (type.isEnum())
            return Enum.valueOf((Class<Enum>) type, value);
        throw new UnsupportedOperationException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_UNSUPPORTED_TYPE, type.getName()));
    }
}
