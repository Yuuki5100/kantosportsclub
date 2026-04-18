package com.example.servercommon.model;

import com.example.servercommon.enums.PermissionLevelType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "user_role_permissions")
@NoArgsConstructor
public class UserRolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ユーザID（users.user_id / String）に統一
    @NotNull
    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @NotNull
    @Column(nullable = false)
    private String resource;

    @NotNull
    @Column(name = "permission_level", nullable = false)
    private int permissionLevel;

    public UserRolePermission(String userId, String resource, int permissionLevel) {
        this.userId = userId;
        this.resource = resource;
        setPermissionLevel(permissionLevel); // enum変換を通す
    }

    public void setPermissionLevel(int permissionLevel) {
        this.permissionLevel = PermissionLevelType.fromCode(permissionLevel);
    }
}
