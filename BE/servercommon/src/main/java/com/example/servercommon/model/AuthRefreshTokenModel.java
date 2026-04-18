package com.example.servercommon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "auth_refresh_token",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_art_jti", columnNames = "jti"),
                @UniqueConstraint(name = "uq_art_user_id", columnNames = "user_id"),
                @UniqueConstraint(name = "uq_art_last_access_jti", columnNames = "last_access_jti")
        },
        indexes = {
                @Index(name = "idx_art_user_id", columnList = "user_id"),
                @Index(name = "idx_art_expires_at", columnList = "expires_at")
        }
)
public class AuthRefreshTokenModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_id", nullable = false)
    private Integer refreshId;

    @Column(name = "jti", nullable = false, length = 64)
    private String jti;

    @Column(name = "user_id", nullable = false, columnDefinition = "CHAR(36)")
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, insertable = false, updatable = false)
    private UserModel user;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(
            name = "created_at",
            nullable = false,
            insertable = false,
            updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime createdAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "last_access_jti", nullable = false, length = 64)
    private String lastAccessJti;
}
