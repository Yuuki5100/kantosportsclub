package com.example.servercommon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
        name = "permissions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_permissions_name_module", columnNames = {"permission_name", "module"})
        },
        indexes = {
                @Index(name = "idx_permissions_creator_user_name", columnList = "creator_user_name")
        }
)
public class PermissionModel {

    @Id
    @Column(name = "permission_id", nullable = false)
    private Integer permissionId;

    @Column(name = "permission_name", nullable = false, length = 150)
    private String permissionName;

    @Column(name = "module", nullable = false, length = 100)
    private String module;

    @Column(name = "creator_user_name", nullable = false, columnDefinition = "CHAR(36)")
    private String creatorUserName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_user_name", nullable = false, insertable = false, updatable = false)
    private UserModel creatorUser;

    @Column(
            name = "created_at",
            nullable = false,
            insertable = false,
            updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime createdAt;
}
