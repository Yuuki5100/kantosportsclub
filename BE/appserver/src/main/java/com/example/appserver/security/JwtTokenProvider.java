package com.example.appserver.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;
import java.time.Instant;

/**
 * JWTトークン発行／検証プロバイダ
 *
 * 【トークン定義（暫定：user_id(String)主キーに統一）】
 * - sub  : userId（ログイン識別子 / String）
 * - uid  : users.user_id（String / CHAR(36)） ※Longは使わない
 * - typ  : "access" / "refresh"
 * - uname: 互換用（移行期間だけ）= userId と同値
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    /** レガシー用（共通期限） */
    @Value("${jwt.expiration:86400000}")
    private long legacyExpirationInMs;

    /** アクセストークンの有効期限 */
    @Value("${jwt.access.expiration-ms}")
    private long accessExpMs;

    @Value("${jwt.access.buffer-ms}")
    private long accessBufferMs;

    /** リフレッシュトークンの有効期限 */
    @Value("${jwt.refresh.expiration-ms}")
    private long refreshExpMs;

    /** トークン種別を切り替えるモード（legacy / access-refresh） */
    @Value("${jwt.mode:access-refresh}")
    private String jwtMode;

    // ============================================================
    // トークン発行関連
    // ============================================================

    /** 共通トークン（旧実装との互換モード） */
    public String generateToken(String subject) {
        Date now = new Date();
        long expMillis = jwtMode.equalsIgnoreCase("access-refresh") ? accessExpMs : legacyExpirationInMs;
        Date expiryDate = new Date(now.getTime() + expMillis);

        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /** 内部サービス間トークン（例：appserver間通信） */
    public String generateInternalServiceToken(String serviceName) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + legacyExpirationInMs);
        return Jwts.builder()
                .setSubject(serviceName)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("role", "ADMIN")
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /** アクセストークン生成：sub=userId(String), uid=user_id(String) */
    public String generateAccessToken(String uid, String userId, UUID jti) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + accessExpMs);

        return Jwts.builder()
                .setSubject(userId)              // ★ userId（ログイン識別子）
                .setId(jti.toString())
                .setIssuedAt(now)
                .setExpiration(exp)
                .claim("uid", uid)               // ★ users.user_id (String/CHAR36)
                .claim("uname", userId)          // 互換用（最終的に削除）
                .claim("typ", "access")
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /** リフレッシュトークン生成：sub=userId(String), uid=user_id(String) */
    public String generateRefreshToken(String uid, UUID jti, UUID familyId, UUID parentJti, String userId) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + refreshExpMs);

        JwtBuilder builder = Jwts.builder()
                .setSubject(userId)              // ★ userId（ログイン識別子）
                .setId(jti.toString())
                .setIssuedAt(now)
                .setExpiration(exp)
                .claim("uid", uid)               // ★ users.user_id (String/CHAR36)
                .claim("typ", "refresh")
                .claim("fid", familyId.toString());

        if (parentJti != null) {
            builder.claim("pjt", parentJti.toString());
        }

        return builder.signWith(getSigningKey(), SignatureAlgorithm.HS512).compact();
    }

    // ============================================================
    // 検証・解析関連
    // ============================================================

    /** JWTから subject を取得（この設計では userId） */
    public String getSubjectFromJWT(String token) {
        Claims claims = parseClaims(token);
        return claims.getSubject();
    }

    /** JWTを検証（署名・期限など） */
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (ExpiredJwtException e) {
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /** JWTを解析し、Claimsを返す（署名検証あり） */
    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isExpired(String token) {
        try {
            parseClaims(token);
            return false;
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public Jws<Claims> parseAndValidate(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
    }

    public long getRemainingAccessMillis(Claims claims) {
        if (claims == null || claims.getExpiration() == null) {
            return -1L;
        }
        return claims.getExpiration().toInstant().toEpochMilli() - Instant.now().toEpochMilli();
    }

    public boolean isWithinAccessRefreshBuffer(Claims claims) {
        long remainingMs = getRemainingAccessMillis(claims);
        return remainingMs > 0 && remainingMs <= accessBufferMs;
    }

    public long getAccessBufferMs() {
        return accessBufferMs;
    }

    // ============================================================
    // 内部ユーティリティ
    // ============================================================

    private SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
