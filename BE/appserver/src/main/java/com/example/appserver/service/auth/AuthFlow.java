package com.example.appserver.service.auth;

import com.example.servercommon.responseModel.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;

import java.util.Locale;

public interface AuthFlow {
    String type(); // "internal" or "gbiz"

    ResponseEntity<ApiResponse<?>> login(
            String username,
            String password,
            HttpServletRequest request,
            HttpServletResponse response,
            Locale locale
    );

    ResponseEntity<ApiResponse<?>> refreshTokens(
            String rawRefreshToken,
            HttpServletRequest request,
            HttpServletResponse response,
            Locale locale
    );

    ResponseEntity<ApiResponse<String>> logout(
            HttpServletRequest request,
            HttpServletResponse response
    );

    ResponseEntity<ApiResponse<?>> getStatus(HttpServletRequest request, Locale locale);

    ResponseEntity<ApiResponse<?>> loginWithExternalService(
            String clientId,
            String clientSecret,
            HttpServletRequest request,
            Locale locale
    );
}
