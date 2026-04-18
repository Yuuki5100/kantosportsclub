package com.example.servercommon.validation;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class CommonValidationRepositoryTest {
    private CommonValidationRepository repository;
    private EntityManager entityManager;
    private TypedQuery<Long> typedQuery;

    @BeforeEach
    void setUp() {
        repository = new CommonValidationRepository();
        entityManager = mock(EntityManager.class);
        typedQuery = mock(TypedQuery.class);

        // リフレクションで private フィールドに EntityManager をセット
        try {
            var field = CommonValidationRepository.class.getDeclaredField("entityManager");
            field.setAccessible(true);
            field.set(repository, entityManager);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void existsByFieldValue_returnsTrue_whenCountGreaterThanZero() {
        String value = "testValue";
        Class<?> entityClass = DummyEntity.class;
        String jpql = "SELECT COUNT(e) FROM DummyEntity e WHERE e.name = :value";

        when(entityManager.createQuery(jpql, Long.class)).thenReturn(typedQuery);
        when(typedQuery.setParameter("value", value)).thenReturn(typedQuery);
        when(typedQuery.getSingleResult()).thenReturn(1L);

        boolean exists = repository.existsByFieldValue(entityClass, "name", value);

        assertThat(exists).isTrue();
        verify(entityManager).createQuery(jpql, Long.class);
        verify(typedQuery).setParameter("value", value);
        verify(typedQuery).getSingleResult();
    }

    @Test
    void existsByFieldValue_returnsFalse_whenCountIsZero() {
        String value = "testValue";
        Class<?> entityClass = DummyEntity.class;
        String jpql = "SELECT COUNT(e) FROM DummyEntity e WHERE e.name = :value";

        when(entityManager.createQuery(jpql, Long.class)).thenReturn(typedQuery);
        when(typedQuery.setParameter("value", value)).thenReturn(typedQuery);
        when(typedQuery.getSingleResult()).thenReturn(0L);

        boolean exists = repository.existsByFieldValue(entityClass, "name", value);

        assertThat(exists).isFalse();
        verify(entityManager).createQuery(jpql, Long.class);
        verify(typedQuery).setParameter("value", value);
        verify(typedQuery).getSingleResult();
    }

    // ダミーエンティティ
    static class DummyEntity {
        private String name;
    }
}

