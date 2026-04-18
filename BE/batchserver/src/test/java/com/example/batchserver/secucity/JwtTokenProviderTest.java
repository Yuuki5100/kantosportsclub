package com.example.batchserver.secucity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.batchserver.config.JwtTokenProvider;

import io.jsonwebtoken.SignatureAlgorithm;

import javax.crypto.SecretKey;
import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() throws Exception {
        tokenProvider = new JwtTokenProvider();

        // HS512 に十分な 512bit キーを生成
        byte[] keyBytes = io.jsonwebtoken.security.Keys.secretKeyFor(SignatureAlgorithm.HS512).getEncoded();
        String encodedSecret = java.util.Base64.getEncoder().encodeToString(keyBytes);

        // リフレクションで jwtSecret と jwtExpirationInMs を設定
        Field secretField = JwtTokenProvider.class.getDeclaredField("jwtSecret");
        secretField.setAccessible(true);
        secretField.set(tokenProvider, encodedSecret);

        Field expField = JwtTokenProvider.class.getDeclaredField("jwtExpirationInMs");
        expField.setAccessible(true);
        expField.set(tokenProvider, 3600000L); // 1時間
    }

    @Test
    void generateToken_ShouldReturnValidToken() {
        String username = "testuser";
        String token = tokenProvider.generateToken(username);
        assertNotNull(token);

        String extractedUsername = tokenProvider.getUsernameFromJWT(token);
        assertEquals(username, extractedUsername);

        assertTrue(tokenProvider.validateToken(token));
    }

    @Test
    void validateToken_ShouldReturnFalse_ForInvalidToken() {
        String invalidToken = "invalid.jwt.token";
        assertFalse(tokenProvider.validateToken(invalidToken));
    }

    @Test
    void generateInternalServiceToken_ShouldReturnValidToken() {
        String serviceName = "appserver";
        String token = tokenProvider.generateInternalServiceToken(serviceName);
        assertNotNull(token);

        String extractedUsername = tokenProvider.getUsernameFromJWT(token);
        assertEquals(serviceName, extractedUsername);

        SecretKey key = tokenProvider.getSigningKey();
        assertNotNull(key);

        assertTrue(tokenProvider.validateToken(token));
    }

    @Test
    void getSigningKey_ShouldReturnSecretKey() {
        assertNotNull(tokenProvider.getSigningKey());
    }
}
