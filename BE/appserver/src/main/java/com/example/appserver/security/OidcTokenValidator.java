package com.example.appserver.security;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.ApiResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Component
public class OidcTokenValidator {

    // 簡易版: モックサーバー用に署名検証をスキップしてdecodeのみ
    public ApiResponse<?> validateAndDecodeMockToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return ApiResponse.error(
                        BackendMessageCatalog.CODE_E401,
                        BackendMessageCatalog.MSG_INVALID_TOKEN_FORMAT);
            }

            // Base64URL decode payload
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            return ApiResponse.success(Map.of("payload", payload));

        } catch (Exception e) {
            return ApiResponse.error(
                    BackendMessageCatalog.CODE_E401,
                    BackendMessageCatalog.format(BackendMessageCatalog.MSG_TOKEN_PARSE_FAILED, e.getMessage()));
        }
    }

    // 本番OIDC用（署名検証あり）
    public Claims validateOidcJwt(String idToken, String publicKeyBase64) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(publicKeyBase64);
            return Jwts.parserBuilder()
                    .setSigningKey(keyBytes)
                    .build()
                    .parseClaimsJws(idToken)
                    .getBody();
        } catch (JwtException e) {
            throw new RuntimeException(
                    BackendMessageCatalog.format(BackendMessageCatalog.MSG_INVALID_ID_TOKEN, e.getMessage()),
                    e);
        }
    }
}
