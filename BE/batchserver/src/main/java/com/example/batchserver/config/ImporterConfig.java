package com.example.batchserver.config;

import com.example.servercommon.validationtemplate.*;
import com.example.servercommon.validationtemplate.loader.TemplateSchemaLoader;
import com.example.servercommon.validationtemplate.mapper.GenericEntityMapper;
import com.example.servercommon.validationtemplate.reader.FileRecordReaderDispatcher;
import com.example.servercommon.validationtemplate.repository.RepositoryResolver;
import com.example.servercommon.validationtemplate.rule.GenericValidator;

import lombok.RequiredArgsConstructor;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ImporterConfig {

    private final ApplicationContext applicationContext;

    @Bean
    public GenericFileImporter genericFileImporter(
            TemplateSchemaLoader loader,
            FileRecordReaderDispatcher dispatcher,
            GenericValidator validator,
            GenericEntityMapper mapper,
            RepositoryResolver resolver) {
        return new GenericFileImporter(loader, dispatcher, validator, mapper, resolver);
    }

}
