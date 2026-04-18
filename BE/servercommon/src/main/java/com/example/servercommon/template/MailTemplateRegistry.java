package com.example.servercommon.template;

import com.example.servercommon.model.MailTemplateEntity;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.repository.MailTemplateRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class MailTemplateRegistry {

    private final MailTemplateRepository mailTemplateRepository;

    // キャッシュ：templateName のみをキーとして保持（ロケールは問わない）
    private final Set<String> availableTemplateNames = ConcurrentHashMap.newKeySet();

    @PostConstruct
    public void init() {
        if (!Boolean.getBoolean("skip.mailtemplate.init")) {
            loadTemplates();
        }
    }

    public void loadTemplates() {
        availableTemplateNames.clear();
        availableTemplateNames.addAll(
            mailTemplateRepository.findAll().stream()
                .map(MailTemplateEntity::getTemplateName)
                .collect(Collectors.toSet())
        );
        log.info(BackendMessageCatalog.LOG_MAIL_TEMPLATE_CACHE_RELOADED, availableTemplateNames);
    }

    public boolean exists(String templateName) {
        return availableTemplateNames.contains(templateName);
    }

    public Set<String> getAllTemplateNames() {
        return Set.copyOf(availableTemplateNames);
    }

    // 明示的なキャッシュ再読み込みAPI向け
    public void reload() {
        loadTemplates();
    }
}
