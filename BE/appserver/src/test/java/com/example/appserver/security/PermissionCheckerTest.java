package com.example.appserver.security;

import com.example.appserver.permission.PermissionConfigProvider;
import com.example.appserver.permission.PermissionConfigProviderImpl;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.repository.RolePermissionRepository;
import com.example.servercommon.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class PermissionCheckerTest {

    private UserRepository userRepository;
    private RolePermissionRepository rolePermissionRepository;
    private PermissionConfigProvider configProvider;
    private PermissionChecker permissionChecker;

    @BeforeEach
    void setup() {
        userRepository = mock(UserRepository.class);
        rolePermissionRepository = mock(RolePermissionRepository.class);
        configProvider = mock(PermissionConfigProvider.class);
        permissionChecker = new PermissionChecker(userRepository, rolePermissionRepository, configProvider);
    }

    @Test
    void test_SystemAdmin_AlwaysPermitted() {
        UserModel adminUser = new UserModel();
        adminUser.setRoleId(UserRole.SYSTEM_ADMIN.getRoleId());

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(adminUser);

        boolean result = permissionChecker.checkPermission(auth, "GET", "/admin/dashboard");
        assertThat(result).isTrue();
    }

    @Test
    void test_NormalRole_PermissionMatched() {
        UserModel user = new UserModel();
        user.setRoleId(UserRole.EDITOR.getRoleId());

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(user);

        PermissionConfigProviderImpl.EndpointPermissions ep = mock(PermissionConfigProviderImpl.EndpointPermissions.class);
        when(ep.getPermissions()).thenReturn(List.of("EDITOR", "VIEWER"));

        when(configProvider.findEndpointPermissions("GET", "/user/profile")).thenReturn(Optional.of(ep));
        when(configProvider.getRequiredLevel("GET /user/profile")).thenReturn(0);

        boolean result = permissionChecker.checkPermission(auth, "GET", "/user/profile");
        assertThat(result).isTrue();
    }

    @Test
    void test_CustomRole_SufficientPermission() {
        UserModel user = new UserModel();
        user.setRoleId(UserRole.CUSTOM.getRoleId());

        Map<Integer, Integer> customPermissions = Map.of(101, 2);

        CustomUserDetails details = mock(CustomUserDetails.class);
        when(details.getDomainUser()).thenReturn(user);
        when(details.getRolePermissions()).thenReturn(customPermissions);

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(details);

        PermissionConfigProviderImpl.EndpointPermissions ep = mock(PermissionConfigProviderImpl.EndpointPermissions.class);
        when(ep.getCustom()).thenReturn(Map.of("101", 1));
        when(ep.getRequiredLevel()).thenReturn(2);

        when(configProvider.findEndpointPermissions("POST", "/admin/dashboard")).thenReturn(Optional.of(ep));
        when(configProvider.getRequiredLevel("POST /admin/dashboard")).thenReturn(0);

        boolean result = permissionChecker.checkPermission(auth, "POST", "/admin/dashboard");
        assertThat(result).isTrue();
    }

    @Test
    void test_CustomRole_InsufficientPermission() {
        UserModel user = new UserModel();
        user.setRoleId(UserRole.CUSTOM.getRoleId());

        Map<Integer, Integer> customPermissions = Map.of(102, 1);

        CustomUserDetails details = mock(CustomUserDetails.class);
        when(details.getDomainUser()).thenReturn(user);
        when(details.getRolePermissions()).thenReturn(customPermissions);

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(details);

        PermissionConfigProviderImpl.EndpointPermissions ep = mock(PermissionConfigProviderImpl.EndpointPermissions.class);
        when(ep.getCustom()).thenReturn(Map.of("102", 2));
        when(ep.getRequiredLevel()).thenReturn(2);

        when(configProvider.findEndpointPermissions("GET", "/user/profile")).thenReturn(Optional.of(ep));
        when(configProvider.getRequiredLevel("GET /user/profile")).thenReturn(0);

        boolean result = permissionChecker.checkPermission(auth, "GET", "/user/profile");
        assertThat(result).isFalse();
    }

    @Test
    void test_UnauthenticatedUser_ShouldReject() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(false);

        boolean result = permissionChecker.checkPermission(auth, "GET", "/any");
        assertThat(result).isFalse();
    }

    @Test
    void test_UnknownEndpoint_ShouldReject() {
        UserModel user = new UserModel();
        user.setRoleId(UserRole.VIEWER.getRoleId());

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(user);

        when(configProvider.findEndpointPermissions("POST", "/unknown")).thenReturn(Optional.empty());
        when(configProvider.getRequiredLevel("POST /unknown")).thenReturn(0);

        boolean result = permissionChecker.checkPermission(auth, "POST", "/unknown");
        assertThat(result).isFalse();
    }

    @Test
    void test_AntPathPattern_Match_Succeeds() {
        UserModel user = new UserModel();
        user.setRoleId(UserRole.VIEWER.getRoleId());

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(user);

        PermissionConfigProviderImpl.EndpointPermissions ep = mock(PermissionConfigProviderImpl.EndpointPermissions.class);
        when(ep.getPermissions()).thenReturn(List.of("VIEWER"));

        when(configProvider.findEndpointPermissions("GET", "/report/polling/1234")).thenReturn(Optional.of(ep));
        when(configProvider.getRequiredLevel("GET /report/polling/1234")).thenReturn(0);

        boolean result = permissionChecker.checkPermission(auth, "GET", "/report/polling/1234");
        assertThat(result).isTrue();
    }
}
