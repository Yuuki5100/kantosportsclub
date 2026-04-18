package com.example.servercommon.template;

import com.example.servercommon.model.MailTemplateEntity;
import com.example.servercommon.repository.MailTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class MailTemplateEngineTest {

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private MailTemplateRepository templateRepository;

    @Mock
    private MailTemplateRegistry registry;

    @InjectMocks
    private MailTemplateEngine mailTemplateEngine;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mailTemplateEngine = new MailTemplateEngine(templateRepository, registry, templateEngine);
    }

    @Test
    void render_success() {
        String html = "<html>Hello ${username}</html>";
        Map<String, Object> vars = Map.of("username", "Taro");

        when(registry.exists("login")).thenReturn(true);
        when(templateRepository.findByTemplateNameAndLocale("login", "ja"))
                .thenReturn(Optional.of(new MailTemplateEntity("login", "ja", "こんにちは", html)));
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("こんにちは Taro");

        String result = mailTemplateEngine.render("login", "ja", vars);

        assertNotNull(result);
        assertTrue(result.contains("Taro"));
    }

    @Test
    void render_shouldThrowIfTemplateMissing() {
        when(registry.exists("ghost")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                mailTemplateEngine.render("ghost", "ja", Map.of()));

        assertEquals("テンプレートが存在しません: ghost", ex.getMessage());
    }

    @Test
    void getSubject_success() {
        MailTemplateEntity entity = new MailTemplateEntity("login", "ja", "件名テスト", "<html></html>");
        when(templateRepository.findByTemplateNameAndLocale("login", "ja"))
                .thenReturn(Optional.of(entity));

        String subject = mailTemplateEngine.getSubject("login", "ja");

        assertEquals("件名テスト", subject);
    }

    @Test
    void getSubject_shouldThrowIfMissing() {
        when(templateRepository.findByTemplateNameAndLocale("missing", "en"))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                mailTemplateEngine.getSubject("missing", "en"));

        assertTrue(ex.getMessage().contains("テンプレートの件名が取得できません"));
    }
}
