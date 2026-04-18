package com.example.servercommon.mapper;

import com.example.servercommon.model.ReportSchema;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Optional;

@Component
public class ReportTemplateMapper {

    /**
     * 指定されたレポートテンプレート名に対応する YAML ファイルを読み込み、
     * ReportSchema にマッピングして返却。
     *
     * @param templateName レポートテンプレート名（例: "users_report"）
     * @return ReportSchema（テンプレート定義）
     * @throws Exception 読み込み・パース失敗時にスロー
     */
    public static ReportSchema loadReportTemplate(String templateName) throws Exception {
        ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

        Resource resource = Optional
                .ofNullable(resolver.getResource("classpath:config/reports/" + templateName + ".yaml"))
                .orElse(resolver.getResource("classpath:config/reports/" + templateName + ".yml"));

        try (InputStream is = resource.getInputStream()) {
            return yamlMapper.readValue(is, ReportSchema.class);
        }
    }
}

