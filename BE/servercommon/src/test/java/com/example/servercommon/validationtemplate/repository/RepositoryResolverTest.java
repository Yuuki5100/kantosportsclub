package com.example.servercommon.validationtemplate.repository;

import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;

class RepositoryResolverTest {

    private ApplicationContext applicationContext;
    private RepositoryResolver resolver;

    interface DummyRepository {
        void save(Object o);
    }

    @BeforeEach
    void setUp() {
        applicationContext = mock(ApplicationContext.class);
        resolver = new RepositoryResolver(applicationContext);
    }

    @Test
    void リポジトリが正常に取得できる() {
        // Arrange
        List<ColumnSchema> schemaList = new ArrayList<>();
        ColumnSchema schema = new ColumnSchema();
        schema.setRepository("dummyRepository");
        schemaList.add(schema);

        DummyRepository mockRepo = mock(DummyRepository.class);
        when(applicationContext.getBean("dummyRepository")).thenReturn(mockRepo);

        // Act
        Object result = resolver.resolveRepository(schemaList);

        // Assert
        assertNotNull(result);
        assertTrue(result instanceof DummyRepository);
        assertSame(mockRepo, result);
    }

    @Test
    void 存在しないリポジトリ名を指定すると例外が投げられる() {
        // Arrange
        List<ColumnSchema> schemaList = new ArrayList<>();
        ColumnSchema schema = new ColumnSchema();
        schema.setRepository("missingRepository");
        schemaList.add(schema);

        when(applicationContext.getBean("missingRepository"))
                .thenThrow(new RuntimeException("Bean not found"));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            resolver.resolveRepository(schemaList);
        });

        assertTrue(ex.getMessage().contains("リポジトリの取得に失敗しました: missingRepository"));
        assertTrue(ex.getCause().getMessage().contains("Bean not found"));
    }
}
