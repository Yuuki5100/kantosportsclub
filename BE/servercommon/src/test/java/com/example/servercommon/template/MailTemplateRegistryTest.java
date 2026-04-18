package com.example.servercommon.template;

import com.example.servercommon.model.MailTemplateEntity;
import com.example.servercommon.repository.MailTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MailTemplateRegistryTest {

    private MailTemplateRepository repository;
    private MailTemplateRegistry registry;

    @BeforeEach
    void setUp() {
        repository = mock(MailTemplateRepository.class);
        registry = new MailTemplateRegistry(repository);
    }

    @Test
    void loadTemplates_shouldCacheTemplateNames() {
        when(repository.findAll()).thenReturn(List.of(
                new MailTemplateEntity("login", "ja", "件名", "<html></html>"),
                new MailTemplateEntity("welcome", "en", "Welcome", "<html></html>")
        ));

        registry.reload();

        assertTrue(registry.exists("login"));
        assertTrue(registry.exists("welcome"));
        assertFalse(registry.exists("ghost"));
        assertEquals(2, registry.getAllTemplateNames().size());
    }

    @Test
    void getAllTemplateNames_shouldReturnUnmodifiableCopy() {
        when(repository.findAll()).thenReturn(List.of(
                new MailTemplateEntity("login", "ja", "件名", "<html></html>")
        ));

        registry.reload();

        Set<String> names = registry.getAllTemplateNames();
        assertThrows(UnsupportedOperationException.class, () -> names.add("hacked"));
    }
}
