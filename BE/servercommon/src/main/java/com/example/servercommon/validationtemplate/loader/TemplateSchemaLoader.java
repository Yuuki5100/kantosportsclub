package com.example.servercommon.validationtemplate.loader;

import com.example.servercommon.config.TemplateProperties;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

@Slf4j
@RequiredArgsConstructor
@Component
public class TemplateSchemaLoader {

    private final TemplateProperties templateProperties;
    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

    public TemplateSchema load(String templateId) {
        String path = templateProperties.getBasePath() + "/" + templateId + ".yaml";
        try (InputStream is = openInputStream(path)) {
            return yamlMapper.readValue(is, TemplateSchema.class);
        } catch (Exception e) {
            throw new RuntimeException(BackendMessageCatalog.format(BackendMessageCatalog.EX_TEMPLATE_SCHEMA_LOAD_FAILED, templateId), e);
        }
    }

    public TemplateSchema loadFromPath(String path) {
        try (InputStream inputStream = openInputStream(path)) {
            return yamlMapper.readValue(inputStream, TemplateSchema.class);
        } catch (Exception e) {
            throw new RuntimeException(BackendMessageCatalog.format(BackendMessageCatalog.EX_TEMPLATE_SCHEMA_LOAD_FROM_PATH_FAILED, path), e);
        }
    }

    private InputStream openInputStream(String path) throws Exception {
        if (path.startsWith("classpath:")) {
            String classpathPath = path.substring("classpath:".length());
            log.debug(BackendMessageCatalog.LOG_TEMPLATE_LOAD_FROM_CLASSPATH, classpathPath);
            return new ClassPathResource(classpathPath).getInputStream();
        } else {
            log.debug(BackendMessageCatalog.LOG_TEMPLATE_LOAD_FROM_FILESYSTEM, path);
            return Files.newInputStream(Paths.get(path));
        }
    }
}
