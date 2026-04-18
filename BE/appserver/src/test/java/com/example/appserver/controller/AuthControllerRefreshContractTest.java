package com.example.appserver.controller;

import com.example.appserver.security.OidcTokenValidator;
import com.example.appserver.security.cookie.RefreshTokenCookieResolver;
import com.example.appserver.service.AuthService;
import com.example.appserver.service.ExternalAuthClient;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.responseModel.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class AuthControllerRefreshContractTest {
    private static final String EX_TIMEOUT = "timeout";

    @Test
    void SC01_UT_037_shouldReturnBadRequestWhenRefreshWithoutCookie() {
        AuthService authService = Mockito.mock(AuthService.class);
        ExternalAuthClient externalAuthClient = Mockito.mock(ExternalAuthClient.class);
        OidcTokenValidator oidcTokenValidator = Mockito.mock(OidcTokenValidator.class);
        RefreshTokenCookieResolver resolver = Mockito.mock(RefreshTokenCookieResolver.class);
        BackendMessageResolver messageResolver = Mockito.mock(BackendMessageResolver.class);

        when(resolver.resolve(any(HttpServletRequest.class))).thenReturn(null);

        AuthController controller = new AuthController(
                authService, externalAuthClient, oidcTokenValidator, resolver, messageResolver);

        ResponseEntity<ApiResponse<?>> response = controller.refresh(
                Mockito.mock(HttpServletRequest.class),
                Mockito.mock(HttpServletResponse.class),
                Locale.JAPAN
        );

        assertEquals(400, response.getStatusCode().value());
    }

    @Test
    void SC01_UT_039_shouldHandleRefreshApiFailureGracefully() {
        AuthService authService = Mockito.mock(AuthService.class);
        ExternalAuthClient externalAuthClient = Mockito.mock(ExternalAuthClient.class);
        OidcTokenValidator oidcTokenValidator = Mockito.mock(OidcTokenValidator.class);
        RefreshTokenCookieResolver resolver = Mockito.mock(RefreshTokenCookieResolver.class);
        BackendMessageResolver messageResolver = Mockito.mock(BackendMessageResolver.class);

        HttpServletRequest req = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse res = Mockito.mock(HttpServletResponse.class);

        when(resolver.resolve(req)).thenReturn("refresh-token");
        when(authService.refreshTokens(eq("refresh-token"), eq(req), eq(res), any(Locale.class)))
                .thenThrow(new RuntimeException(EX_TIMEOUT));

        AuthController controller = new AuthController(
                authService, externalAuthClient, oidcTokenValidator, resolver, messageResolver);

        assertThrows(RuntimeException.class, () -> controller.refresh(req, res, Locale.JAPAN));
    }

    @Test
    void SC01_UT_040_shouldReturnForbiddenWhenRefreshNotAllowedByRole() {
        AuthService authService = Mockito.mock(AuthService.class);
        ExternalAuthClient externalAuthClient = Mockito.mock(ExternalAuthClient.class);
        OidcTokenValidator oidcTokenValidator = Mockito.mock(OidcTokenValidator.class);
        RefreshTokenCookieResolver resolver = Mockito.mock(RefreshTokenCookieResolver.class);
        BackendMessageResolver messageResolver = Mockito.mock(BackendMessageResolver.class);

        HttpServletRequest req = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse res = Mockito.mock(HttpServletResponse.class);

        when(resolver.resolve(req)).thenReturn("refresh-token");
        when(authService.refreshTokens(eq("refresh-token"), eq(req), eq(res), any(Locale.class)))
                .thenReturn(ResponseEntity.status(403)
                        .body(ApiResponse.error(BackendMessageCatalog.CODE_E403, BackendMessageCatalog.MSG_ACCESS_DENIED)));

        AuthController controller = new AuthController(
                authService, externalAuthClient, oidcTokenValidator, resolver, messageResolver);
        ResponseEntity<ApiResponse<?>> response = controller.refresh(req, res, Locale.JAPAN);

        assertEquals(403, response.getStatusCode().value());
    }
}
