package com.example.appserver.response.role;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RoleResponseSc03Test {

    @Test
    void SC03_UT_020_shouldMapRoleDetailEntityToResponseCorrectly() {
        LocalDateTime createdAt = LocalDateTime.now().minusDays(1);
        LocalDateTime updatedAt = LocalDateTime.now();

        RoleDetailResponse response = new RoleDetailResponse(
                10,
                "Operator",
                false,
                null,
                "Role for operations",
                "Admin User",
                "admin",
                createdAt,
                "Editor User",
                "editor",
                updatedAt,
                List.of()
        );

        assertThat(response.getRoleId()).isEqualTo(10);
        assertThat(response.getRoleName()).isEqualTo("Operator");
        assertThat(response.getDescription()).isEqualTo("Role for operations");
        assertThat(response.getCreatorUserId()).isEqualTo("admin");
        assertThat(response.getEditorUserId()).isEqualTo("editor");
        assertThat(response.getPermissionDetails()).isEmpty();
    }
}
