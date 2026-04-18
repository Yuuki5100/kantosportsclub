package com.example.appserver.service.auth;

import com.example.appserver.service.ExternalAuthClient;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.responseModel.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GbizAuthFlow implements AuthFlow {

    private final ExternalAuthClient externalAuthClient;
    private final BackendMessageResolver messageResolver;

    private final String redirectURI = "http://localhost:3000/callback";

    @Override
    public String type() {
        return "gbiz";
    }

    @Override
    public ResponseEntity<ApiResponse<?>> login(
            String username, String password,
            HttpServletRequest request,
            HttpServletResponse response,
            Locale locale
    ) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                        BackendMessageCatalog.CODE_E400,
                        messageResolver.resolveError(BackendMessageCatalog.CODE_E400, locale)));
    }

    @Override
    public ResponseEntity<ApiResponse<?>> loginWithExternalService(
            String clientId,
            String clientSecret,
            HttpServletRequest request,
            Locale locale
    ) {
        log.info(BackendMessageCatalog.LOG_GBIZ_AUTH_URL_GENERATING);
        try {
            String state = UUID.randomUUID().toString();
            String nonce = UUID.randomUUID().toString();

            URI authorizationUri = externalAuthClient.buildAuthorizationUri(
                    clientId, redirectURI,
                    "openid profile email offline_access",
                    state, nonce, "login", null);

            HttpSession session = request.getSession(true);
            session.setAttribute("OAUTH2_STATE", state);
            session.setAttribute("OAUTH2_NONCE", nonce);

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "authType", "gbiz",
                    "authorizationUrl", authorizationUri.toString(),
                    "stateUsed", state,
                    "nonceUsed", nonce
            )));
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_GBIZ_AUTH_URL_BUILD_FAILED, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            BackendMessageCatalog.CODE_E500,
                            messageResolver.resolveError(BackendMessageCatalog.CODE_E500, locale)));
        }
    }

    @Override
    public ResponseEntity<ApiResponse<?>> refreshTokens(
            String rawRefreshToken,
            HttpServletRequest request,
            HttpServletResponse response,
            Locale locale
    ) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                        BackendMessageCatalog.CODE_E400,
                        messageResolver.resolveError(BackendMessageCatalog.CODE_E400, locale)));
    }

    @Override
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_LOGGED_OUT_SUCCESS));
    }

    @Override
    public ResponseEntity<ApiResponse<?>> getStatus(HttpServletRequest request, Locale locale) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(
                            BackendMessageCatalog.CODE_E403,
                            messageResolver.resolveError(BackendMessageCatalog.CODE_E403, locale)));
        }

        ApiResponse<?> validation = externalAuthClient.verifyIdToken(session);
        return ResponseEntity.status(validation.isSuccess() ? HttpStatus.OK : HttpStatus.FORBIDDEN)
                .body(validation);
    }
}
