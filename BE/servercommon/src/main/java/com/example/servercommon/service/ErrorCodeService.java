package com.example.servercommon.service;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.ErrorCode;
import com.example.servercommon.repository.ErrorCodeRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class ErrorCodeService {

    private final ErrorCodeRepository errorCodeRepository;
    private final Map<String, String> propertiesMessages = new HashMap<>();
    private final boolean usePropertiesOnly;

    public ErrorCodeService(ErrorCodeRepository errorCodeRepository) {
        this.errorCodeRepository = errorCodeRepository;

        String profile = System.getProperty("spring.profiles.active", "");
        this.usePropertiesOnly = "test".equalsIgnoreCase(profile);

        if (usePropertiesOnly) {
            try (InputStream input = getClass().getResourceAsStream("/error-codes.properties")) {
                Properties props = new Properties();
                props.load(new InputStreamReader(input, StandardCharsets.UTF_8));
                for (String key : props.stringPropertyNames()) {
                    propertiesMessages.put(key, props.getProperty(key));
                }
                log.info(BackendMessageCatalog.LOG_ERROR_CODE_SERVICE_TEST_PROFILE);
            } catch (IOException e) {
                throw new UncheckedIOException(BackendMessageCatalog.EX_ERROR_CODES_PROPERTIES_LOAD_FAILED, e);
            }
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "errorCodes", key = "#code + '_' + #locale")
    public String getErrorMessage(String code, String locale) {
        if (usePropertiesOnly) {
            String resolved = propertiesMessages.get(code);
            if (resolved != null) {
                return resolved;
            }
            if (!Locale.JAPAN.getLanguage().equalsIgnoreCase(locale)) {
                String fallback = propertiesMessages.get(code);
                if (fallback != null) {
                    return fallback;
                }
            }
            return BackendMessageCatalog.MSG_UNKNOWN_ERROR_PREFIX + code + ")";
        }
        return errorCodeRepository.findByCodeAndLocale(code, locale)
                .map(ErrorCode::getMessage)
                .or(() -> errorCodeRepository.findByCodeAndLocale(code, Locale.JAPAN.getLanguage())
                        .map(ErrorCode::getMessage))
                .orElse(BackendMessageCatalog.MSG_UNKNOWN_ERROR_PREFIX + code + ")");
    }

    public String getErrorMessage(String code, Object[] args, String locale) {
        String template = getErrorMessage(code, locale);
        validatePlaceholderCount(code, template, args != null ? args.length : 0, locale);
        return MessageFormat.format(template, args != null ? args : new Object[0]);
    }

    public String getErrorMessage(String code, List<Object> args, String locale) {
        return getErrorMessage(code, args != null ? args.toArray() : new Object[0], locale);
    }

    private void validatePlaceholderCount(String code, String template, int providedArgCount, String locale) {
        try {
            int expected = getMaxPlaceholderIndex(template) + 1;
            if (providedArgCount < expected) {
                log.warn(BackendMessageCatalog.LOG_ERROR_MESSAGE_ARGS_MISMATCH,
                        code, locale, expected, providedArgCount, template);
            }
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_ERROR_PLACEHOLDER_ANALYZE_FAILED, code, e.getMessage(), e);
        }
    }

    private int getMaxPlaceholderIndex(String template) {
        Pattern pattern = Pattern.compile("\\{(\\d+)}");
        Matcher matcher = pattern.matcher(template);
        int maxIndex = -1;
        while (matcher.find()) {
            int index = Integer.parseInt(matcher.group(1));
            if (index > maxIndex) {
                maxIndex = index;
            }
        }
        return maxIndex;
    }
}
