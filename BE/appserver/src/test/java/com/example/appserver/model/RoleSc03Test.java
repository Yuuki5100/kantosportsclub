package com.example.appserver.model;

import com.example.servercommon.model.RoleModel;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RoleSc03Test {

    @Test
    void SC03_UT_029_shouldHandleNullDescriptionWhenMappingRole() {
        RoleModel role = new RoleModel();
        role.setRoleId(5);
        role.setRoleName("Viewer");
        role.setDescription(null);

        assertThat(role.getRoleId()).isEqualTo(5);
        assertThat(role.getRoleName()).isEqualTo("Viewer");
        assertThat(role.getDescription()).isNull();
    }
}
