package com.example.servercommon.validationtemplate.repository;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;

@Component
public class RepositoryResolver {

    private static final Logger log = LoggerFactory.getLogger(RepositoryResolver.class);

    private final ApplicationContext applicationContext;

    public RepositoryResolver(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    // 引数のList<ColumnSchema>のrepositoryは、すべて同じでなければならない仕様
    // List<ColumnSchema>の中で、複数種類のrepositoryが存在する場合、呼び出す側でrepositoryを１種類になるように整形してください
    public Object resolveRepository(List<ColumnSchema> schemas) {
        for (ColumnSchema schema : schemas) {
            Assert.notNull(schema, "TemplateSchema は null ではいけません");

            String repositoryName = schema.getRepository();
            String schemaIdentifier = schema.toString(); // fallback

            if (repositoryName == null || repositoryName.trim().isEmpty()) {
                throw new IllegalArgumentException(BackendMessageCatalog.format(
                        BackendMessageCatalog.EX_TEMPLATE_SCHEMA_REPOSITORY_REQUIRED, schemaIdentifier));
            }

            try {
                log.debug(BackendMessageCatalog.LOG_REPOSITORY_RESOLVE_PROCESSING, repositoryName);
                return applicationContext.getBean(repositoryName);
            } catch (Exception e) {
                log.error(BackendMessageCatalog.LOG_REPOSITORY_RESOLVE_FAILED, repositoryName, schemaIdentifier, e);
                throw new RuntimeException(BackendMessageCatalog.format(
                        BackendMessageCatalog.EX_REPOSITORY_RESOLVE_FAILED, repositoryName), e);
            }
        }
        // List<ColumnSchema>のrepositoryはすべて同じであるため１個目のrepositoryを返せばOK
        return schemas.get(0).getRepository();
    }
}
