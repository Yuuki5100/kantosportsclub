package com.example.servercommon.validation;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class CommonValidationRepository {
    @PersistenceContext
    private EntityManager entityManager;

    public boolean existsByFieldValue(Class<?> entityClass, String fieldName, String value) {
        String jpql = "SELECT COUNT(e) FROM " + entityClass.getSimpleName() + " e " +
                "WHERE e." + fieldName + " = :value";

        Long count = entityManager.createQuery(jpql, Long.class)
                .setParameter("value", value)
                .getSingleResult();

        return count > 0;
    }
}
