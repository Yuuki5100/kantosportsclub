package com.example.appserver.security;

import com.example.servercommon.model.RolePermissionModel;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.RolePermissionRepository;
import com.example.servercommon.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ActiveProfiles("test")
public class CustomUserDetailsServiceTest {

    private UserRepository userRepository;
    private RolePermissionRepository rolePermissionRepository;
    private CustomUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        rolePermissionRepository = mock(RolePermissionRepository.class);
        userDetailsService = new CustomUserDetailsService(userRepository, rolePermissionRepository);
    }

    @Test
    void loadUserByUsername_ユーザーが存在する場合_CustomUserDetailsが返る() {
        UserModel user = new UserModel();
        user.setUserId("testuser");
        user.setPassword("hashedpw");
        user.setEmail("test@example.com");
        user.setRoleId(4);

        RolePermissionModel p1 = new RolePermissionModel();
        p1.setRoleId(4);
        p1.setPermissionId(1);
        p1.setStatusLevelId(3);
        RolePermissionModel p2 = new RolePermissionModel();
        p2.setRoleId(4);
        p2.setPermissionId(2);
        p2.setStatusLevelId(2);

        List<RolePermissionModel> permissions = List.of(p1, p2);

        when(userRepository.findByUserId("testuser")).thenReturn(Optional.of(user));
        when(rolePermissionRepository.findAllByRoleId(4)).thenReturn(permissions);

        var userDetails = userDetailsService.loadUserByUsername("testuser");

        assertThat(userDetails).isInstanceOf(CustomUserDetails.class);
        CustomUserDetails custom = (CustomUserDetails) userDetails;

        assertThat(custom.getUsername()).isEqualTo("testuser");
        assertThat(custom.getRolePermissions())
                .containsEntry(1, 3)
                .containsEntry(2, 2);
    }

    @Test
    void loadUserByUsername_ユーザーが存在しない場合_例外スロー() {
        when(userRepository.findByUserId("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("unknown"))
                .isInstanceOf(org.springframework.security.core.userdetails.UsernameNotFoundException.class)
                .hasMessageContaining("User not found");
    }
}
