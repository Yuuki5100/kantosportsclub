package com.example.servercommon.service;

import com.example.servercommon.model.MailMessage;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(OutputCaptureExtension.class)
class MockEmailSenderTest {

    @Test
    void send_shouldLogOutput(CapturedOutput output) {
        // Arrange
        MockEmailSender sender = new MockEmailSender();

        MailMessage msg = MailMessage.builder()
                .to("dev@example.com")
                .subject("モック通知")
                .htmlBody("<p>Hello</p>")
                .templateName(null)
                .templateVariables(Map.of())
                .build();

        // Act
        sender.send(msg);

        // Assert
        String logs = output.getOut();  // ← 標準出力ログを取得
        assertTrue(logs.contains("MockEmailSender"));
        assertTrue(logs.contains("dev@example.com"));
        assertTrue(logs.contains("モック通知"));
    }
}
