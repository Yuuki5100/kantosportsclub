package com.example.appserver.service;

import com.example.servercommon.template.MailTemplateEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class MailPreviewService {

    private final MailTemplateEngine mailTemplateEngine;

    public String renderBody(String templateName, String locale, Map<String, Object> variables) {
        return mailTemplateEngine.render(templateName, locale, variables);
    }

    public String getSubject(String templateName, String locale) {
        return mailTemplateEngine.getSubject(templateName, locale);
    }
}
