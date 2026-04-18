package com.example.servercommon.service;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.MailMessage;
import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.template.MailTemplateEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

import java.util.Collections;
import java.util.Optional;

@Slf4j
@Service
@Profile("!test")   // ← local でも動かせるように変更（必要ならこのまま）
@RequiredArgsConstructor
public class SesEmailSender implements EmailSender {

    private final SesClient sesClient;
    private final MailTemplateEngine mailTemplateEngine;
    private final TeamsNotificationService teamsNotificationService;

    @Value("${mail.from}")
    private String from;

    @Async
    @Override
    public void send(MailMessage message) {
        try {
            String subject = Optional.ofNullable(message.getSubject()).orElse("");
            String renderedHtml = Optional.ofNullable(message.getHtmlBody()).orElse("");

            if (message.getTemplateName() != null && message.getLocale() != null) {
                renderedHtml = mailTemplateEngine.render(
                        message.getTemplateName(),
                        message.getLocale(),
                        Optional.ofNullable(message.getTemplateVariables()).orElse(Collections.emptyMap())
                );
                if (subject.isBlank()) {
                    subject = mailTemplateEngine.getSubject(message.getTemplateName(), message.getLocale());
                }
            }

            SendEmailRequest request = SendEmailRequest.builder()
                    .source(from)
                    .destination(Destination.builder()
                            .toAddresses(Collections.singletonList(message.getTo()))
                            .build())
                    .message(Message.builder()
                            .subject(Content.builder().data(subject).build())
                            .body(Body.builder()
                                    .html(Content.builder().data(renderedHtml).build())
                                    .build())
                            .build())
                    .build();

            sesClient.sendEmail(request);
            log.info(BackendMessageCatalog.LOG_SES_MAIL_SENT, message.getTo(), subject);

        } catch (Exception e) {
            String errorMessage = String.format(BackendMessageCatalog.MSG_SES_MAIL_SEND_FAILED_DETAIL,
                    message.getTo(), message.getSubject(), e.getMessage());
            log.error(BackendMessageCatalog.LOG_SES_MAIL_SEND_FAILED, errorMessage, e);
            teamsNotificationService.sendNotification(BackendMessageCatalog.MSG_SES_MAIL_SEND_FAILED_PREFIX + errorMessage);
        }
    }
}
