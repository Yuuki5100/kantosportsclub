package com.example.servercommon.validationtemplate.mapper;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

public class TemplateGetMapper {
    private static final String DEFAULT_BASE_PATH = "classpath:config/templates";
    private static final Logger log = LoggerFactory.getLogger(TemplateGetMapper.class);
    /**
     * Load a YAML template file and return its parsed schema.
     *
     * Example: templateName "orders" -> classpath:config/templates/orders.yaml
     *
     * @param templateName template file name without extension
     * @return map of template name (key) to parsed TemplateSchema (value)
     * @throws Exception when the file is missing or cannot be parsed
     */
    public static Map<String, TemplateSchema> templateGet(String templateName) throws Exception {
        return templateGet(templateName, DEFAULT_BASE_PATH);
    }

    public static Map<String, TemplateSchema> templateGet(String templateName, String basePath) throws Exception {
        // Result map (key: template name, value: TemplateSchema).
        Map<String, TemplateSchema> templates = new HashMap<>();
        // YAML parser.
        ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

        // Resolve template resources under the base path.
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        String normalizedBasePath = (basePath == null || basePath.isBlank())
                ? DEFAULT_BASE_PATH
                : basePath;
        if (normalizedBasePath.endsWith("/")) {
            normalizedBasePath = normalizedBasePath.substring(0, normalizedBasePath.length() - 1);
        }
        // Resource path example: classpath:config/templates/orders.yaml
        Resource resource = Optional
                .ofNullable(resolver.getResource(normalizedBasePath + "/" + templateName + ".yaml"))
                .orElse(resolver.getResource(normalizedBasePath + "/" + templateName + ".yml"));

        // Open InputStream for the template file (try-with-resources).
        try (InputStream is = resource.getInputStream()) {

            // Reload stream for parsing (InputStream cannot be reused).
            try (InputStream reloaded = resource.getInputStream()) {
                // Get filename for key derivation.
                String fileName = resource.getFilename();

                // If filename is missing or not .yaml, treat as not found.
                if (fileName == null || !fileName.endsWith(".yaml"))
                    throw new FileNotFoundException();

                // "orders.yaml" -> "orders"
                String templateKey = fileName.substring(0, fileName.length() - 5); // ".yaml" suffix

                // Parse YAML into TemplateSchema.
                TemplateSchema schema = yamlMapper.readValue(reloaded, TemplateSchema.class);
                // Store into result map.
                templates.put(templateKey, schema);
            } catch (FileNotFoundException e) {
                throw new FileNotFoundException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_TEMPLATE_FILE_NOT_FOUND, templateName));
            } catch (JsonParseException e) {
                log.error(BackendMessageCatalog.LOG_TEMPLATE_JSON_PARSE_ERROR, e.getMessage(), e);
            } catch (JsonMappingException e) {
                log.error(BackendMessageCatalog.LOG_TEMPLATE_FIELD_PATH);
                e.getPath().forEach(ref -> log.error(BackendMessageCatalog.LOG_TEMPLATE_FIELD_ITEM, ref.getFieldName()));
                throw new JsonParseException(BackendMessageCatalog.EX_TEMPLATE_MAPPING_ERROR);
            } catch (Exception e) {
                throw new Exception(BackendMessageCatalog.EX_TEMPLATE_UNEXPECTED_ERROR);
            }
            // Return parsed templates map.
            return templates;
        }
    }
}
