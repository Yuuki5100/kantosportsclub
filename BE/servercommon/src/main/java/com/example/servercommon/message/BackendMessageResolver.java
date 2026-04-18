package com.example.servercommon.message;

import java.util.Locale;

import org.springframework.stereotype.Component;

import com.example.servercommon.service.ErrorCodeService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BackendMessageResolver {

    private final ErrorCodeService errorCodeService;

    public String resolveError(String code, Locale locale) {
        String message = errorCodeService.getErrorMessage(code, language(locale));
        if (message == null || message.isBlank()) {
            return BackendMessageCatalog.MSG_UNKNOWN_ERROR;
        }
        return message;
    }

    public String resolveError(String code, Locale locale, Object... args) {
        String message = errorCodeService.getErrorMessage(code, args, language(locale));
        if (message == null || message.isBlank()) {
            return BackendMessageCatalog.MSG_UNKNOWN_ERROR;
        }
        return message;
    }

    private String language(Locale locale) {
        if (locale == null || locale.getLanguage() == null || locale.getLanguage().isBlank()) {
            return Locale.JAPAN.getLanguage();
        }
        return locale.getLanguage();
    }
}
