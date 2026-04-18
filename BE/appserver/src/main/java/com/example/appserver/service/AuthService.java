package com.example.appserver.service;

import com.example.appserver.config.AuthProperties;
import com.example.appserver.service.auth.AuthFlow;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AuthService {

    private final AuthProperties authProperties;
    private final Map<String, AuthFlow> flows;

    public AuthService(AuthProperties authProperties, List<AuthFlow> flowList) {
        this.authProperties = authProperties;
        this.flows = flowList.stream()
                .collect(Collectors.toMap(f -> f.type().toLowerCase(), f -> f));
    }

    private AuthFlow flow() {
        String type = Optional.ofNullable(authProperties.getType()).orElse("").toLowerCase();
        AuthFlow f = flows.get(type);
        if (f == null) {
            throw new IllegalStateException(BackendMessageCatalog.format(BackendMessageCatalog.EX_UNKNOWN_AUTH_TYPE, type));
        }
        return f;
    }

    public ResponseEntity<ApiResponse<?>> login(
            String user_id,
            String password,
            HttpServletRequest request,
            HttpServletResponse response,
            Locale locale
    ) {
        return flow().login(user_id, password, request, response, locale);
    }

    public ResponseEntity<ApiResponse<?>> refreshTokens(
            String rawRefreshToken,
            HttpServletRequest request,
            HttpServletResponse response,
            Locale locale
    ) {
        return flow().refreshTokens(rawRefreshToken, request, response, locale);
    }

    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request, HttpServletResponse response) {
        return flow().logout(request, response);
    }

    public ResponseEntity<ApiResponse<?>> getStatus(HttpServletRequest request, Locale locale) {
        return flow().getStatus(request, locale);
    }

    public ResponseEntity<ApiResponse<?>> loginWithExternalService(
            String clientId,
            String clientSecret,
            HttpServletRequest request,
            Locale locale
    ) {
        return flow().loginWithExternalService(clientId, clientSecret, request, locale);
    }
}
