package com.example.appserver.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.impl.DefaultClaims;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    private final String secretKey = Base64.getEncoder().encodeToString(
            "this_is_a_super_secure_key_for_testing_purposes_only_please_change_it".getBytes()
    );

    @BeforeEach
    void setup() throws Exception {
        jwtTokenProvider = new JwtTokenProvider();

        var jwtSecretField = JwtTokenProvider.class.getDeclaredField("jwtSecret");
        jwtSecretField.setAccessible(true);
        jwtSecretField.set(jwtTokenProvider, secretKey);

        var legacyExpField = JwtTokenProvider.class.getDeclaredField("legacyExpirationInMs");
        legacyExpField.setAccessible(true);
        legacyExpField.set(jwtTokenProvider, 3600000L);

        var accessExpField = JwtTokenProvider.class.getDeclaredField("accessExpMs");
        accessExpField.setAccessible(true);
        accessExpField.set(jwtTokenProvider, 60000L);

        var accessBufferField = JwtTokenProvider.class.getDeclaredField("accessBufferMs");
        accessBufferField.setAccessible(true);
        accessBufferField.set(jwtTokenProvider, 30000L);

        var refreshExpField = JwtTokenProvider.class.getDeclaredField("refreshExpMs");
        refreshExpField.setAccessible(true);
        refreshExpField.set(jwtTokenProvider, 120000L);

        var modeField = JwtTokenProvider.class.getDeclaredField("jwtMode");
        modeField.setAccessible(true);
        modeField.set(jwtTokenProvider, "access-refresh");
    }

    @Test
    void testGenerateTokenAndValidate() {
        String token = jwtTokenProvider.generateToken("testuser");
        assertNotNull(token);

        assertTrue(jwtTokenProvider.validateToken(token));

        String subject = jwtTokenProvider.getSubjectFromJWT(token);
        assertEquals("testuser", subject);
    }

    @Test
    void testGenerateInternalServiceToken() {
        String token = jwtTokenProvider.generateInternalServiceToken("service-A");
        Claims claims = jwtTokenProvider.parseClaims(token);

        assertEquals("service-A", claims.getSubject());
        assertEquals("ADMIN", claims.get("role"));
        assertFalse(jwtTokenProvider.isExpired(token));
    }

    @Test
    void testGenerateAccessToken() {
        UUID jti = UUID.randomUUID();

        // ★ uid は String（暫定：users.user_id と同じキー）
        String token = jwtTokenProvider.generateAccessToken("testuser", "testuser", jti);

        Claims claims = jwtTokenProvider.parseClaims(token);
        assertEquals("testuser", claims.getSubject());      // sub=userId
        assertEquals("testuser", claims.get("uid"));        // uid=String
        assertEquals("access", claims.get("typ"));
        assertEquals("testuser", claims.get("uname"));      // 互換用
        assertEquals(jti.toString(), claims.getId());
    }

    @Test
    void testGenerateRefreshToken() {
        UUID jti = UUID.randomUUID();
        UUID familyId = UUID.randomUUID();

        // ★ uid は String
        String token = jwtTokenProvider.generateRefreshToken("testuser", jti, familyId, null, "testuser");

        Claims claims = jwtTokenProvider.parseClaims(token);
        assertEquals("testuser", claims.getSubject());      // sub=userId
        assertEquals("testuser", claims.get("uid"));        // uid=String
        assertEquals("refresh", claims.get("typ"));
        assertEquals(familyId.toString(), claims.get("fid"));
    }

    @Test
    void testValidateToken_InvalidSignature() {
        String token = jwtTokenProvider.generateToken("user");
        String tampered = token + "x";
        assertFalse(jwtTokenProvider.validateToken(tampered));
    }

    @Test
    void testParseAndValidate() {
        String token = jwtTokenProvider.generateToken("user");
        Jws<Claims> jws = jwtTokenProvider.parseAndValidate(token);
        assertEquals("user", jws.getBody().getSubject());
    }

    @Test
    void testIsExpired() {
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey));
        String expiredToken = io.jsonwebtoken.Jwts.builder()
                .setSubject("expired")
                .setIssuedAt(new java.util.Date(System.currentTimeMillis() - 10000))
                .setExpiration(new java.util.Date(System.currentTimeMillis() - 5000))
                .signWith(key, io.jsonwebtoken.SignatureAlgorithm.HS512)
                .compact();

        assertTrue(jwtTokenProvider.isExpired(expiredToken));
    }

    @Test
    void testIsWithinAccessRefreshBuffer_TrueInsideBuffer() {
        DefaultClaims claims = new DefaultClaims();
        claims.setExpiration(new java.util.Date(System.currentTimeMillis() + 20_000L));

        assertTrue(jwtTokenProvider.isWithinAccessRefreshBuffer(claims));
    }

    @Test
    void testIsWithinAccessRefreshBuffer_FalseOutsideBuffer() {
        DefaultClaims claims = new DefaultClaims();
        claims.setExpiration(new java.util.Date(System.currentTimeMillis() + 45_000L));

        assertFalse(jwtTokenProvider.isWithinAccessRefreshBuffer(claims));
    }

    @Test
    void testIsWithinAccessRefreshBuffer_FalseWhenExpired() {
        DefaultClaims claims = new DefaultClaims();
        claims.setExpiration(new java.util.Date(System.currentTimeMillis() - 1_000L));

        assertFalse(jwtTokenProvider.isWithinAccessRefreshBuffer(claims));
    }
}
