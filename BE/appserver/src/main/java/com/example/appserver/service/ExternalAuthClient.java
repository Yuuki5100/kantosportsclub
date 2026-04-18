package com.example.appserver.service;

import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.servercommon.responseModel.TokenResponse;
import com.example.appserver.config.AuthProperties;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.responseModel.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

import java.math.BigInteger;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import java.security.*;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.algorithms.Algorithm;

/**
 * OpenID Connect形式の認証方式部品（モックサーバー対応版）
 */
@Slf4j
@Component
public class ExternalAuthClient {

    // ✅ モックサーバーのURLに変更
    private final AuthProperties authProperties;
    private final RestTemplate restTemplate;
    private final BackendMessageResolver messageResolver;
    private static final int SESSION_TIMEOUT = 1800000; // 秒
    private volatile RSAPublicKey cachedPublicKey;

    public ExternalAuthClient(
            AuthProperties authProperties,
            RestTemplate restTemplate,
            RSAPublicKey cachedPublicKey,
            BackendMessageResolver messageResolver) {
        this.authProperties = authProperties;
        this.restTemplate = restTemplate;
        this.cachedPublicKey = cachedPublicKey;
        this.messageResolver = messageResolver;
    }

    /**
     * 認可リクエストURIを生成
     */
    public URI buildAuthorizationUri(String clientId, String redirectUri, String scope, String state, String nonce,
            String prompt, String loginHint) {

        String encodedScope = scope.replace(" ", "%20");

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(getAuthUrl())
                .queryParam("response_type", "code")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("scope", encodedScope)
                .queryParam("state", state)
                .queryParam("nonce", nonce);

        if (prompt != null)
            builder.queryParam("prompt", prompt);
        if (loginHint != null)
            builder.queryParam("login_hint", loginHint);

        return builder.build(true).toUri();
    }

    /**
     * 認可コードをトークンに交換
     */
    public TokenResponse exchangeCodeForToken(
            String clientId,
            String clientSecret,
            String code,
            String redirectUri) {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("code", code);
        params.add("redirect_uri", "http://localhost:8081/auth/external-login");

        // Authorizationヘッダ（Basic認証）
        String credentials = clientId + ":" + clientSecret;
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.add("Authorization", "Basic " + encoded);

        // ✅ モックサーバーの /oauth/token にPOST
        ResponseEntity<TokenResponse> response = restTemplate.postForEntity(
                getTokenUrl(),
                new HttpEntity<>(params, headers),
                TokenResponse.class);

        return response.getBody();
    }

    /**
     * コールバック時にモックサーバーへリクエストを投げ、
     * アクセストークンとリフレッシュトークンを取得する。
     */
    public ApiResponse<?> handleCallback(
            String code,
            String state,
            HttpServletRequest request,
            Locale locale) {

        // ① state検証（CSRF対策）
        String expectedState = (String) request.getSession().getAttribute("OAUTH2_STATE");
        if (expectedState == null || !state.equals(expectedState)) {
            return ApiResponse.error(
                    BackendMessageCatalog.CODE_E401,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E401, locale));
        }

        try {
            // ② モックサーバーへトークンリクエスト
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("code", code);
            params.add("redirect_uri", "http://localhost:8081/auth/callback");

            // Basic 認証ヘッダ（クライアントIDとシークレットを設定）
            String clientId = "mock-client";
            String clientSecret = "mock-secret";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(clientId, clientSecret);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

            ResponseEntity<TokenResponse> response = restTemplate.postForEntity(
                    getTokenUrl(),
                    requestEntity,
                    TokenResponse.class);

            log.info(BackendMessageCatalog.LOG_EXTERNAL_TOKEN_RESPONSE, response.getBody());

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                return ApiResponse.error(
                        BackendMessageCatalog.CODE_E500,
                        messageResolver.resolveError(BackendMessageCatalog.CODE_E500, locale));
            }

            TokenResponse tokenResponse = response.getBody();

            if (tokenResponse == null || tokenResponse.getAccessToken() == null) {
                return ApiResponse.error(
                        BackendMessageCatalog.CODE_E500,
                        messageResolver.resolveError(BackendMessageCatalog.CODE_E500, locale));
            }

            // ③ トークンをセッションに保存
            request.getSession().setAttribute("ACCESS_TOKEN", tokenResponse.getAccessToken());
            request.getSession().setAttribute("REFRESH_TOKEN", tokenResponse.getRefreshToken());
            request.getSession().setAttribute("ID_TOKEN", tokenResponse.getIdToken()); // ★ これを追加！
            request.getSession().setMaxInactiveInterval(SESSION_TIMEOUT);

            // ④ 正常レスポンスとしてFEに返却
            return ApiResponse.success(tokenResponse);

        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_REFRESH_TOKEN_FAILED, e);
            return ApiResponse.error(
                    BackendMessageCatalog.CODE_E500,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E500, locale));
        }
    }

    /**
     * アクセストークンを使ってユーザー属性情報を取得
     * （モックサーバーの /oauth/userinfo を呼び出す）
     */
    public ResponseEntity<ApiResponse<?>> fetchUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.add("Authorization", "Bearer " + accessToken);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    "http://localhost:4000/oauth/userinfo",
                    HttpMethod.GET,
                    entity,
                    Map.class);
            if (response.getStatusCode() != HttpStatus.OK) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error(
                                BackendMessageCatalog.CODE_E500,
                                messageResolver.resolveError(BackendMessageCatalog.CODE_E500, Locale.JAPAN)));
            }

            log.info(BackendMessageCatalog.LOG_EXTERNAL_USERINFO_RESPONSE, response.getBody());

            return ResponseEntity.ok(ApiResponse.success(response.getBody()));

        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_EXTERNAL_USERINFO_FETCH_FAILED, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            BackendMessageCatalog.CODE_E500,
                            messageResolver.resolveError(BackendMessageCatalog.CODE_E500, Locale.JAPAN)));
        }
    }

    /**
     * リフレッシュトークンでアクセストークンを再発行
     */
    public TokenResponse refreshAccessToken(String clientId, String clientSecret, String refreshToken) {
        try {
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "refresh_token");
            params.add("refresh_token", refreshToken);
            params.add("scope", "openid profile email offline_access");

            String credentials = clientId + ":" + clientSecret;
            String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.add("Authorization", "Basic " + encoded);

            ResponseEntity<TokenResponse> response = restTemplate.postForEntity(
                    "http://localhost:4000/oauth/token",
                    new HttpEntity<>(params, headers),
                    TokenResponse.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info(BackendMessageCatalog.LOG_REFRESH_TOKEN_SUCCESS);
                return response.getBody();
            } else {
                throw new RuntimeException(BackendMessageCatalog.EX_REFRESH_RESPONSE_INVALID);
            }

        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_REFRESH_TOKEN_FAILED, e);
            throw new RuntimeException(
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_TOKEN_REFRESH_FAILED, e.getMessage()));
        }
    }

    /**
     * id_token（JWT）の署名検証
     */
    public ApiResponse<?> verifyIdToken(HttpSession session) {
        try {
            String idToken = (String) session.getAttribute("ID_TOKEN");
            if (idToken == null) {
                return ApiResponse.error(
                        BackendMessageCatalog.CODE_E401,
                        messageResolver.resolveError(BackendMessageCatalog.CODE_E401, Locale.JAPAN));
            }

            // 公開鍵を取得（キャッシュ利用）
            RSAPublicKey publicKey = getGbizPublicKey();

            Algorithm algorithm = Algorithm.RSA256(publicKey, null);

            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer("https://gbiz-id.go.jp/oauth") // 本番Issuer
                    .build();

            DecodedJWT jwt = verifier.verify(idToken);

            // 有効期限チェック
            if (jwt.getExpiresAt().toInstant().isBefore(Instant.now())) {
                return ApiResponse.error(
                        BackendMessageCatalog.CODE_E401,
                        messageResolver.resolveError(BackendMessageCatalog.CODE_E401, Locale.JAPAN));
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("authenticated", true);
            payload.put("sub", jwt.getClaim("sub").asString());
            payload.put("name", jwt.getClaim("name").asString());
            payload.put("email", jwt.getClaim("email").asString());
            payload.put("exp", jwt.getExpiresAt());
            payload.put("iss", jwt.getIssuer());

            log.info(
                    BackendMessageCatalog.LOG_GBIZ_IDTOKEN_VERIFIED,
                    jwt.getClaim("sub").asString(),
                    jwt.getExpiresAt());
            return ApiResponse.success(payload);

        } catch (JWTVerificationException e) {
            log.error(BackendMessageCatalog.LOG_GBIZ_IDTOKEN_VERIFY_FAILED, e.getMessage());
            return ApiResponse.error(
                    BackendMessageCatalog.CODE_E401,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E401, Locale.JAPAN));
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_GBIZ_IDTOKEN_PROCESS_ERROR, e);
            return ApiResponse.error(
                    BackendMessageCatalog.CODE_E500,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E500, Locale.JAPAN));
        }
    }

    /**
     * GビズIDのJWKセットから公開鍵を取得
     */
    private RSAPublicKey getGbizPublicKey() {
        if (cachedPublicKey != null) {
            return cachedPublicKey;
        }

        try {
            // 本番: https://gbiz-id.go.jp/oauth/keys
            // モック: http://localhost:4000/oauth/keys
            String jwkUrl = "http://localhost:4000/oauth/keys";
            URI uri = URI.create(jwkUrl);

            Map<String, Object> response = restTemplate.getForObject(uri, Map.class);
            List<Map<String, Object>> keys = (List<Map<String, Object>>) response.get("keys");

            if (keys == null || keys.isEmpty()) {
                throw new IllegalStateException(BackendMessageCatalog.EX_JWK_KEY_NOT_FOUND);
            }

            // 通常は1つ目のキーを使用
            Map<String, Object> keyData = keys.get(0);
            String n = (String) keyData.get("n");
            String e = (String) keyData.get("e");

            byte[] modulusBytes = Base64.getUrlDecoder().decode(n);
            byte[] exponentBytes = Base64.getUrlDecoder().decode(e);

            BigInteger modulus = new BigInteger(1, modulusBytes);
            BigInteger exponent = new BigInteger(1, exponentBytes);

            RSAPublicKeySpec keySpec = new RSAPublicKeySpec(modulus, exponent);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            cachedPublicKey = (RSAPublicKey) keyFactory.generatePublic(keySpec);

            log.info(BackendMessageCatalog.LOG_GBIZ_PUBLIC_KEY_FETCHED, modulus.bitLength());
            return cachedPublicKey;

        } catch (Exception e) {
            throw new RuntimeException(
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_GBIZ_PUBLIC_KEY_FETCH_FAILED, e.getMessage()),
                    e);
        }
    }

    /**
     * 現在の認証タイプに応じたURLを取得
     */
    private String getAuthUrl() {
        String type = authProperties.getType();
        if ("internal".equalsIgnoreCase(type)) {
            return authProperties.getInternal().getAuthUrl();
        }
        return authProperties.getGbiz().getAuthUrl();
    }

    private String getTokenUrl() {
        String type = authProperties.getType();
        if ("internal".equalsIgnoreCase(type)) {
            return authProperties.getInternal().getTokenUrl();
        }
        return authProperties.getGbiz().getTokenUrl();
    }
}
