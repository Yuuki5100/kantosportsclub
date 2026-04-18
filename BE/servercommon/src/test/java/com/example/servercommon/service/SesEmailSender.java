package com.example.servercommon.service;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.MailMessage;
import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.template.MailTemplateEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

@Component
@ConditionalOnProperty(name = "mail.from")
@RequiredArgsConstructor
@Slf4j
public class SesEmailSender {
    private static final String MSG_EMAIL_SEND_FAILED_PREFIX = "メール送信に失敗しました: ";

    private final SesClient sesClient;
    private final MailTemplateEngine templateEngine;
    private final TeamsNotificationService notificationService;

    @Value("${mail.from}")
    private String from;

    public void send(MailMessage message) {
        try {
            String htmlBody = message.getHtmlBody();
            String subject = message.getSubject();

            if (htmlBody == null && message.getTemplateName() != null) {
                htmlBody = templateEngine.render(
                    message.getTemplateName(),
                    message.getLocale(),
                    message.getTemplateVariables()
                );
                subject = templateEngine.getSubject(
                    message.getTemplateName(),
                    message.getLocale()
                );
            }

            SendEmailRequest request = SendEmailRequest.builder()
                .destination(Destination.builder()
                    .toAddresses(message.getTo())
                    .build())
                .message(Message.builder()
                    .subject(Content.builder().data(subject).charset("UTF-8").build())
                    .body(Body.builder()
                        .html(Content.builder().data(htmlBody).charset("UTF-8").build())
                        .build())
                    .build())
                .source(from)
                .build();

            SendEmailResponse response = sesClient.sendEmail(request);
            log.info(BackendMessageCatalog.LOG_BATCH_RESULT, response.messageId());
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_MAIL_SEND_FAILED, e.getMessage(), e);
            notificationService.sendNotification(MSG_EMAIL_SEND_FAILED_PREFIX + e.getMessage());
        }
    }
}
