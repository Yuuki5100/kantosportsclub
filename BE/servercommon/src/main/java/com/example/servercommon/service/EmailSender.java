package com.example.servercommon.service;

import com.example.servercommon.model.MailMessage;

/**
 * メール送信インターフェース
 */
public interface EmailSender {
    void send(MailMessage message);
}
