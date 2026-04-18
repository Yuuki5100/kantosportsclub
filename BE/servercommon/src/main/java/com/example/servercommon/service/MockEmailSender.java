package com.example.servercommon.service;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.MailMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("test")
public class MockEmailSender implements EmailSender {

    @Override
    public void send(MailMessage message) {
        log.info(BackendMessageCatalog.LOG_MOCK_EMAIL_SENT,
                message.getTo(), message.getSubject(), message.getHtmlBody());
    }
}
