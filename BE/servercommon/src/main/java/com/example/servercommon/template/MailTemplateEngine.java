package com.example.servercommon.template;

import com.example.servercommon.model.MailTemplateEntity;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.repository.MailTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templateresolver.StringTemplateResolver;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class MailTemplateEngine {

    private final MailTemplateRepository mailTemplateRepository;
    private final MailTemplateRegistry mailTemplateRegistry;

    private final TemplateEngine templateEngine;

    /**
     * テンプレートをレンダリングして HTML 文字列を返す。
     */
    public String render(String templateName, String locale, Map<String, Object> variables) {
        if (!mailTemplateRegistry.exists(templateName)) {
            throw new RuntimeException(BackendMessageCatalog.format(BackendMessageCatalog.EX_MAIL_TEMPLATE_NOT_FOUND, templateName));
        }

        MailTemplateEntity template = mailTemplateRepository.findByTemplateNameAndLocale(templateName, locale)
                .orElseThrow(() -> new RuntimeException(BackendMessageCatalog.EX_MAIL_TEMPLATE_LOCALE_NOT_FOUND));

        try {
            String htmlTemplate = convertToThymeleafSyntax(template.getBody());

            Context context = new Context();
            context.setVariables(variables);

            return templateEngine.process(htmlTemplate, context);
        } catch (Exception e) {
            throw new RuntimeException(BackendMessageCatalog.EX_MAIL_TEMPLATE_RENDER_FAILED, e);
        }
    }

    /**
     * {{variable}} → ${variable} に変換（Thymeleaf形式）
     */
    private String convertToThymeleafSyntax(String input) {
        return input.replaceAll("\\{\\{\\s*(\\w+)\\s*}}", "\\${$1}");
    }

    public String getSubject(String templateName, String locale) {
        return mailTemplateRepository.findByTemplateNameAndLocale(templateName, locale)
                .map(MailTemplateEntity::getSubject)
                .orElseThrow(() -> new RuntimeException(BackendMessageCatalog.EX_MAIL_TEMPLATE_SUBJECT_NOT_FOUND));
    }
}
