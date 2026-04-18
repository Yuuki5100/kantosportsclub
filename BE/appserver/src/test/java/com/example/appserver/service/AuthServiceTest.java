package com.example.appserver.service;

import com.example.appserver.config.AuthProperties;
import com.example.appserver.service.auth.AuthFlow;
import com.example.servercommon.responseModel.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private AuthProperties authProperties;
    private AuthFlow authFlow;
    private AuthService authService;

    private HttpServletRequest request;
    private HttpServletResponse response;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        authProperties = mock(AuthProperties.class);
        authFlow = mock(AuthFlow.class);
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);

        when(authProperties.getType()).thenReturn("internal");
        when(authFlow.type()).thenReturn("internal");

        authService = new AuthService(authProperties, List.of(authFlow));
    }

    @Test
    void login_delegatesToFlow() {
        ResponseEntity<ApiResponse<?>> expected = ResponseEntity.ok(ApiResponse.success(Map.of("ok", true)));
        when(authFlow.login(any(), any(), any(), any(), any())).thenReturn(expected);

        ResponseEntity<ApiResponse<?>> res =
                authService.login("user", "pass", request, response, Locale.JAPAN);

        assertSame(expected, res);
        verify(authFlow).login(eq("user"), eq("pass"), eq(request), eq(response), eq(Locale.JAPAN));
    }

    @Test
    void refreshTokens_delegatesToFlow() {
        ResponseEntity<ApiResponse<?>> expected = ResponseEntity.ok(ApiResponse.success(Map.of("ok", true)));
        when(authFlow.refreshTokens(any(), any(), any(), any())).thenReturn(expected);

        ResponseEntity<ApiResponse<?>> res =
                authService.refreshTokens("refresh", request, response, Locale.JAPAN);

        assertSame(expected, res);
        verify(authFlow).refreshTokens(eq("refresh"), eq(request), eq(response), eq(Locale.JAPAN));
    }

    @Test
    void logout_delegatesToFlow() {
        ResponseEntity<ApiResponse<String>> expected = ResponseEntity.ok(ApiResponse.success("ok"));
        when(authFlow.logout(any(), any())).thenReturn(expected);

        ResponseEntity<ApiResponse<String>> res = authService.logout(request, response);

        assertSame(expected, res);
        verify(authFlow).logout(eq(request), eq(response));
    }

    @Test
    void getStatus_delegatesToFlow() {
        ResponseEntity<ApiResponse<?>> expected = ResponseEntity.ok(ApiResponse.success(Map.of("ok", true)));
        when(authFlow.getStatus(any(), any())).thenReturn(expected);

        ResponseEntity<ApiResponse<?>> res = authService.getStatus(request, Locale.JAPAN);

        assertSame(expected, res);
        verify(authFlow).getStatus(eq(request), eq(Locale.JAPAN));
    }

    @Test
    void loginWithExternalService_delegatesToFlow() {
        ResponseEntity<ApiResponse<?>> expected = ResponseEntity.ok(ApiResponse.success(Map.of("ok", true)));
        when(authFlow.loginWithExternalService(any(), any(), any(), any())).thenReturn(expected);

        ResponseEntity<ApiResponse<?>> res =
                authService.loginWithExternalService("id", "secret", request, Locale.JAPAN);

        assertSame(expected, res);
        verify(authFlow).loginWithExternalService(eq("id"), eq("secret"), eq(request), eq(Locale.JAPAN));
    }

    @Test
    void SC01_UT_038_shouldRejectUnknownAuthType() {
        when(authProperties.getType()).thenReturn("unknown");
        AuthService bad = new AuthService(authProperties, List.of(authFlow));

        assertThrows(IllegalStateException.class,
                () -> bad.login("user", "pass", request, response, Locale.JAPAN));
    }
}
