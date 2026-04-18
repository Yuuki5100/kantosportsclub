package com.example.servercommon.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Data;

@Entity
@Table(name = "refresh_tokens")
@Data
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * users.user_id (CHAR(36)) に紐づくログイン識別子
     */
    @Column(name = "user_id", length = 36, nullable = false)
    private String userId;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked", nullable = false)
    private boolean revoked;

    @Column(name = "used", nullable = false)
    private boolean used;

    // UUIDをStringとして扱う
    @Column(name = "family_id", length = 36, nullable = false)
    private String familyId;

    @Column(name = "parent_jti", length = 36)
    private String parentJti;

    @Column(name = "jti", length = 36, unique = true, nullable = false)
    private String jti;
}
