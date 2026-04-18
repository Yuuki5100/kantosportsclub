package com.example.appserver.controller;

import com.example.appserver.request.auth.LoginRequest;
import com.example.appserver.security.OidcTokenValidator;
import com.example.appserver.service.AuthService;
import com.example.appserver.service.ExternalAuthClient;
import com.example.appserver.security.cookie.RefreshTokenCookieResolver;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.responseModel.TokenResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final ExternalAuthClient externalAuthClient;
    private final OidcTokenValidator oidcTokenValidator;
    private final RefreshTokenCookieResolver refreshTokenCookieResolver;
    private final BackendMessageResolver messageResolver;

    public AuthController(
            AuthService authService,
            ExternalAuthClient externalAuthClient,
            OidcTokenValidator oidcTokenValidator,
            RefreshTokenCookieResolver refreshTokenCookieResolver,
            BackendMessageResolver messageResolver
    ) {
        this.authService = authService;
        this.externalAuthClient = externalAuthClient;
        this.oidcTokenValidator = oidcTokenValidator;
        this.refreshTokenCookieResolver = refreshTokenCookieResolver;
        this.messageResolver = messageResolver;
    }

    /**
     * internal のみを想定（gbizは /auth/external-login を使う）
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response,
            Locale locale
    ) {
        // Cookie発行があるので response を渡す
        return authService.login(loginRequest.getUser_id(), loginRequest.getPassword(), request, response, locale);
    }

    /**
     * refresh: Cookie(REFRESH_TOKEN) + CSRF 必須
     */
    //@PostMapping("/refresh")
    public ResponseEntity<ApiResponse<?>> refresh(
            HttpServletRequest request,
            HttpServletResponse response,
            Locale locale
    ) {
        log.info(BackendMessageCatalog.LOG_REFRESH_ENDPOINT_CALLED);

        String refreshToken = refreshTokenCookieResolver.resolve(request);
        if (!StringUtils.hasText(refreshToken)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            BackendMessageCatalog.CODE_E400,
                            messageResolver.resolveError(BackendMessageCatalog.CODE_E400, locale)));
        }

        return authService.refreshTokens(refreshToken, request, response, locale);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request, HttpServletResponse response) {
        return authService.logout(request, response);
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<?>> status(HttpServletRequest request, Locale locale) {
        return authService.getStatus(request, locale);
    }

    /**
     * 外部サービス認証用ログイン（gbiz導線）
     */
    @GetMapping("/external-login")
    public ResponseEntity<ApiResponse<?>> externalLogin(
            @RequestParam String clientId,
            @RequestParam String clientSecret,
            HttpServletRequest request,
            Locale locale
    ) {
        return authService.loginWithExternalService(clientId, clientSecret, request, locale);
    }

    @GetMapping("/callback")
    public ResponseEntity<ApiResponse<?>> callback(
            @RequestParam("code") String code,
            @RequestParam("state") String state,
            HttpServletRequest request,
            Locale locale
    ) {
        ApiResponse<?> result = externalAuthClient.handleCallback(code, state, request, locale);
        if (!result.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }

        TokenResponse tokenResponse = (TokenResponse) result.getData();

        ApiResponse<?> decoded = oidcTokenValidator.validateAndDecodeMockToken(tokenResponse.getIdToken());
        if (!decoded.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(decoded);
        }

        // ここは「Cookie運用に寄せる」なら最終的に Set-Cookie に変更対象
        // ただし現段階の既存仕様を維持するならこのまま返す
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "ACCESS_TOKEN", tokenResponse.getAccessToken(),
                "REFRESH_TOKEN", tokenResponse.getRefreshToken(),
                "ID_TOKEN", tokenResponse.getIdToken(),
                "claims", decoded.getData()
        )));
    }
}
