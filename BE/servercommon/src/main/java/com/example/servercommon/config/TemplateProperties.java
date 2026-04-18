package com.example.servercommon.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
// @Configuration
@ConfigurationProperties(prefix = "template.schema")
public class TemplateProperties {
    private String basePath;
}
