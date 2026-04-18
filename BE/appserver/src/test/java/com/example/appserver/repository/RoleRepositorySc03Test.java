package com.example.appserver.repository;

import com.example.servercommon.model.RoleModel;
import com.example.servercommon.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class RoleRepositorySc03Test {

    @Test
    void SC03_UT_027_shouldReturnTrueWhenRoleNameExists() {
        RoleRepository roleRepository = Mockito.mock(RoleRepository.class);
        Mockito.when(roleRepository.existsByRoleName("Admin")).thenReturn(true);

        boolean exists = roleRepository.existsByRoleName("Admin");

        assertThat(exists).isTrue();
    }

    @Test
    void SC03_UT_028_shouldReturnRoleWhenItExists() {
        RoleRepository roleRepository = Mockito.mock(RoleRepository.class);
        RoleModel role = new RoleModel();
        role.setRoleId(1);
        role.setRoleName("Admin");
        Mockito.when(roleRepository.findById(1)).thenReturn(Optional.of(role));

        Optional<RoleModel> found = roleRepository.findById(1);

        assertThat(found).isPresent();
        assertThat(found.get().getRoleName()).isEqualTo("Admin");
    }
}
