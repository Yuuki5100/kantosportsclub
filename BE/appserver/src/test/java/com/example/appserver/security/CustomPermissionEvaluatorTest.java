package com.example.appserver.security;

import com.example.appserver.config.PermissionProperties;
import com.example.appserver.permission.PermissionConfigProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

class CustomPermissionEvaluatorTest {

    private PermissionChecker permissionChecker;
    private PermissionConfigProvider permissionConfigProvider;
    private PermissionProperties permissionProperties;
    private CustomPermissionEvaluator evaluator;

    @BeforeEach
    void setUp() {
        permissionChecker = mock(PermissionChecker.class);
        permissionConfigProvider = mock(PermissionConfigProvider.class);
        permissionProperties = new PermissionProperties();
        permissionProperties.setMethodSecurityAllowIfUnmapped(true);
        permissionProperties.setMethodSecurityDefaultMethod("GET");
        evaluator = new CustomPermissionEvaluator(permissionChecker, permissionConfigProvider, permissionProperties);
    }

    @Test
    void hasPermission_withNulls_returnsFalse() {
        assertFalse(evaluator.hasPermission(null, "/user/profile", 1));
        assertFalse(evaluator.hasPermission(authenticated("user"), null, 1));
        assertFalse(evaluator.hasPermission(authenticated("user"), "/user/profile", null));
    }

    @Test
    void hasPermission_withNonIntegerPermission_returnsFalse() {
        assertFalse(evaluator.hasPermission(authenticated("user"), "/user/profile", "invalid"));
    }

    @Test
    void hasPermission_whenUnmappedAndAllowFlagTrue_returnsTrue() {
        Authentication authentication = authenticated("user");
        when(permissionConfigProvider.findEndpointPermissions("GET", "/user/profile")).thenReturn(Optional.empty());

        assertTrue(evaluator.hasPermission(authentication, "/user/profile", 2));
        verify(permissionChecker, never()).checkPermission(any(), anyString(), anyString(), anyInt());
    }

    @Test
    void hasPermission_whenUnmappedAndAllowFlagFalse_delegatesToPermissionChecker() {
        Authentication authentication = authenticated("user");
        permissionProperties.setMethodSecurityAllowIfUnmapped(false);
        when(permissionConfigProvider.findEndpointPermissions("GET", "/user/profile")).thenReturn(Optional.empty());
        when(permissionChecker.checkPermission(authentication, "GET", "/user/profile", 2)).thenReturn(false);

        assertFalse(evaluator.hasPermission(authentication, "/user/profile", 2));
        verify(permissionChecker).checkPermission(authentication, "GET", "/user/profile", 2);
    }

    @Test
    void hasPermission_withMethodPrefixedTarget_usesExplicitMethod() {
        Authentication authentication = authenticated("user");
        when(permissionConfigProvider.findEndpointPermissions("POST", "/admin/user/list")).thenReturn(Optional.of(mock(PermissionConfigProvider.EndpointPermissions.class)));
        when(permissionChecker.checkPermission(authentication, "POST", "/admin/user/list", 3)).thenReturn(true);

        assertTrue(evaluator.hasPermission(authentication, "POST /admin/user/list", 3));
    }

    @Test
    void checkPermission_withDefaultMethod_delegatesUsingConfiguredDefault() {
        Authentication authentication = authenticated("user");
        when(permissionConfigProvider.findEndpointPermissions("GET", "/user/profile")).thenReturn(Optional.of(mock(PermissionConfigProvider.EndpointPermissions.class)));
        when(permissionChecker.checkPermission(authentication, "GET", "/user/profile", 0)).thenReturn(true);

        assertTrue(evaluator.checkPermission(authentication, "/user/profile"));
        verify(permissionChecker).checkPermission(authentication, "GET", "/user/profile", 0);
    }

    private Authentication authenticated(Object principal) {
        TestingAuthenticationToken token = new TestingAuthenticationToken(principal, null);
        token.setAuthenticated(true);
        return token;
    }
}
