package com.example.appserver.config;

import com.example.servercommon.validationtemplate.*;
import com.example.servercommon.validationtemplate.loader.TemplateSchemaLoader;
import com.example.servercommon.validationtemplate.mapper.GenericEntityMapper;
import com.example.servercommon.validationtemplate.reader.FileRecordReaderDispatcher;
import com.example.servercommon.validationtemplate.repository.RepositoryResolver;
import com.example.servercommon.validationtemplate.rule.GenericValidator;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ImporterConfig {

    @Bean
    public GenericFileImporter genericFileImporter(
            TemplateSchemaLoader schemaLoader,
            FileRecordReaderDispatcher readerDispatcher,
            GenericValidator validator,
            GenericEntityMapper entityMapper,
            RepositoryResolver repositoryResolver) {
        return new GenericFileImporter(
                schemaLoader,
                readerDispatcher,
                validator,
                entityMapper,
                repositoryResolver);
    }
}
