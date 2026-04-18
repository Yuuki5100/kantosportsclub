package com.example.servercommon.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "roles",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_roles_role_name", columnNames = "role_name")
        },
        indexes = {
                @Index(name = "idx_roles_creator_user_id", columnList = "creator_user_id"),
                @Index(name = "idx_roles_editor_user_id", columnList = "editor_user_id")
        }
)
public class RoleModel {

    @Id
    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;

    @Lob
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

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
            insertable = false,
            updatable = false,
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
            insertable = false,
            updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    )
    private LocalDateTime updatedAt;
}
