package com.example.servercommon.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.example.servercommon.utils.DateFormatUtil;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_users_email", columnNames = "email")
        },
        indexes = {
                @Index(name = "idx_users_role_id", columnList = "role_id"),
                @Index(name = "idx_users_creator_user_id", columnList = "creator_user_id"),
                @Index(name = "idx_users_editor_user_id", columnList = "editor_user_id")
        }
)
public class UserModel {

    @Id
    @Column(name = "user_id", nullable = false, columnDefinition = "CHAR(36)")
    private String userId;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "given_name", nullable = false, length = 100)
    private String givenName;

    @Column(name = "surname", nullable = false, length = 100)
    private String surname;

    @Column(name = "mobile_no", length = 30)
    private String mobileNo;

    @Column(name = "email", length = 254)
    private String email;

    @Transient
    private String timezone;

    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false, insertable = false, updatable = false)
    private RoleModel role;

    @Column(name = "password_set_time")
    private LocalDateTime passwordSetTime;

    @Column(name = "failed_login_attempts", nullable = false)
    private Integer failedLoginAttempts = 0;

    @Column(name = "is_locked_out", nullable = false)
    private Boolean isLockedOut = false;

    @Column(name = "lock_out_time")
    private LocalDateTime lockOutTime;

    @Column(name = "latest_login_time")
    private LocalDateTime latestLoginTime;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Lob
    @Column(name = "deletion_reason", columnDefinition = "TEXT")
    private String deletionReason;

    @Column(name = "creator_user_id", nullable = false, columnDefinition = "CHAR(36)")
    private String creatorUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_user_id", nullable = false, insertable = false, updatable = false)
    private UserModel creatorUser;

    @Column(
            name = "created_at",
            nullable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime createdAt;

    @Column(name = "editor_user_id", nullable = false, columnDefinition = "CHAR(36)")
    private String editorUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "editor_user_id", nullable = false, insertable = false, updatable = false)
    private UserModel editorUser;

    @Column(
            name = "updated_at",
            nullable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    )
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = DateFormatUtil.nowUtcLocalDateTime();
    }
}
