package com.example.appserver.config;

import com.example.appserver.permission.PermissionConfigProvider;
import com.example.appserver.permission.PermissionConfigProviderImpl;
import com.example.appserver.security.CustomUserDetails;
import com.example.appserver.security.PermissionChecker;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.repository.RolePermissionRepository;
import com.example.servercommon.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ActiveProfiles("test")
class PermissionCheckerTest {

    private UserRepository userRepository;
    private RolePermissionRepository rolePermissionRepository;
    private PermissionConfigProvider configProvider;
    private PermissionChecker checker;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        rolePermissionRepository = mock(RolePermissionRepository.class);
        configProvider = mock(PermissionConfigProvider.class);
        checker = new PermissionChecker(userRepository, rolePermissionRepository, configProvider);
    }

    @Test
    void testCheckPermission_systemAdmin_returnsTrue() {
        UserModel user = new UserModel();
        user.setUserId("admin");
        user.setRoleId(UserRole.SYSTEM_ADMIN.getRoleId());

        var auth = new TestingAuthenticationToken(new CustomUserDetails(user, Map.of()), null);
        auth.setAuthenticated(true);

        assertTrue(checker.checkPermission(auth, "POST", "/any", 10));
    }

    @Test
    void testCheckPermission_customUser_withSufficientLevel_returnsTrue() {
        UserModel user = new UserModel();
        user.setUserId("custom");
        user.setRoleId(UserRole.CUSTOM.getRoleId());

        var details = new CustomUserDetails(user, Map.of(101, 5));

        PermissionConfigProviderImpl.EndpointPermissions ep = mock(PermissionConfigProviderImpl.EndpointPermissions.class);
        when(configProvider.findEndpointPermissions("POST", "/resource")).thenReturn(Optional.of(ep));
        when(ep.getCustom()).thenReturn(Map.of("101", 3));
        when(ep.getRequiredLevel()).thenReturn(3);

        var auth = new TestingAuthenticationToken(details, null);
        auth.setAuthenticated(true);

        assertTrue(checker.checkPermission(auth, "POST", "/resource", 3));
    }

    @Test
    void testCheckPermission_customUser_withInsufficientLevel_returnsFalse() {
        UserModel user = new UserModel();
        user.setUserId("custom");
        user.setRoleId(UserRole.CUSTOM.getRoleId());

        var details = new CustomUserDetails(user, Map.of(102, 1));

        PermissionConfigProviderImpl.EndpointPermissions ep = mock(PermissionConfigProviderImpl.EndpointPermissions.class);
        when(configProvider.findEndpointPermissions("GET", "/resource")).thenReturn(Optional.of(ep));
        when(ep.getCustom()).thenReturn(Map.of("102", 3));
        when(ep.getRequiredLevel()).thenReturn(3);

        var auth = new TestingAuthenticationToken(details, null);
        auth.setAuthenticated(true);

        assertFalse(checker.checkPermission(auth, "GET", "/resource", 3));
    }

    @Test
    void testCheckPermission_normalRole_grantedByConfig_returnsTrue() {
        UserModel user = new UserModel();
        user.setUserId("viewer");
        user.setRoleId(UserRole.VIEWER.getRoleId());

        var details = new CustomUserDetails(user, Map.of());

        PermissionConfigProviderImpl.EndpointPermissions ep = mock(PermissionConfigProviderImpl.EndpointPermissions.class);
        when(configProvider.findEndpointPermissions("GET", "/profile")).thenReturn(Optional.of(ep));
        when(ep.getPermissions()).thenReturn(List.of("VIEWER", "ADMIN"));

        var auth = new TestingAuthenticationToken(details, null);
        auth.setAuthenticated(true);

        assertTrue(checker.checkPermission(auth, "GET", "/profile", 0));
    }

    @Test
    void testCheckPermission_nonCustomUserDetailsPrincipal_returnsUserFromRepo() {
        var springUser = new org.springframework.security.core.userdetails.User("editor", "pass", List.of());

        UserModel domainUser = new UserModel();
        domainUser.setUserId("editor");
        domainUser.setRoleId(UserRole.EDITOR.getRoleId());

        when(userRepository.findByUserId("editor")).thenReturn(Optional.of(domainUser));

        PermissionConfigProviderImpl.EndpointPermissions ep = mock(PermissionConfigProviderImpl.EndpointPermissions.class);
        when(configProvider.findEndpointPermissions("GET", "/user")).thenReturn(Optional.of(ep));
        when(ep.getPermissions()).thenReturn(List.of("EDITOR"));

        var auth = new TestingAuthenticationToken(springUser, null);
        auth.setAuthenticated(true);

        assertTrue(checker.checkPermission(auth, "GET", "/user", 0));
    }
}
