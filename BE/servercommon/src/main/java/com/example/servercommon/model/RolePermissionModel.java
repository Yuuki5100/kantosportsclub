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

@Getter
@Setter
@Entity
@Table(
        name = "role_permissions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_role_permissions", columnNames = {"role_id", "permission_id"})
        },
        indexes = {
                @Index(name = "idx_rp_role_id", columnList = "role_id"),
                @Index(name = "idx_rp_permission_id", columnList = "permission_id"),
                @Index(name = "idx_rp_status_level_id", columnList = "status_level_id")
        }
)
public class RolePermissionModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_permission_id", nullable = false)
    private Integer rolePermissionId;

    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false, insertable = false, updatable = false)
    private RoleModel role;

    @Column(name = "permission_id", nullable = false)
    private Integer permissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false, insertable = false, updatable = false)
    private PermissionModel permission;

    @Column(name = "status_level_id", nullable = false)
    private Integer statusLevelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_level_id", nullable = false, insertable = false, updatable = false)
    private StatusLevelModel statusLevel;
}
