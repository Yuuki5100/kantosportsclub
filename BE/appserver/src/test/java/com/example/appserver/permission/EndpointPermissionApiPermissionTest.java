package com.example.appserver.permission;

import com.example.appserver.security.PermissionChecker;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.repository.RolePermissionRepository;
import com.example.servercommon.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class EndpointPermissionApiPermissionTest {

    @Test
    @DisplayName("SC02-UT-024 shouldReturn403WhenNoPermissionToCallUserApi")
    void SC02_UT_022_shouldReturn403WhenNoPermissionToCallUserApi() {
        UserRepository userRepository = mock(UserRepository.class);
        RolePermissionRepository rolePermissionRepository = mock(RolePermissionRepository.class);
        PermissionConfigProvider provider = mock(PermissionConfigProvider.class);

        PermissionConfigProvider.EndpointPermissions ep = endpointPermissions(List.of("EDITOR"), Map.of(), 2);
        when(provider.findEndpointPermissions("POST", "/api/user/create")).thenReturn(Optional.of(ep));
        when(provider.getRequiredLevel("POST /api/user/create")).thenReturn(2);

        PermissionChecker checker = new PermissionChecker(userRepository, rolePermissionRepository, provider);

        UserModel viewer = new UserModel();
        viewer.setUserId("viewer-1");
        viewer.setRoleId(UserRole.VIEWER.getRoleId());
        Authentication auth = new UsernamePasswordAuthenticationToken(viewer, null, List.of());

        assertFalse(checker.checkPermission(auth, "POST", "/api/user/create"));
    }

    @Test
    @DisplayName("SC02-UT-025 shouldAllowWhenPermissionExistsToCallUserApi")
    void SC02_UT_023_shouldAllowWhenPermissionExistsToCallUserApi() {
        UserRepository userRepository = mock(UserRepository.class);
        RolePermissionRepository rolePermissionRepository = mock(RolePermissionRepository.class);
        PermissionConfigProvider provider = mock(PermissionConfigProvider.class);

        PermissionConfigProvider.EndpointPermissions ep = endpointPermissions(List.of("VIEWER"), Map.of(), 1);
        when(provider.findEndpointPermissions("POST", "/api/user/create")).thenReturn(Optional.of(ep));
        when(provider.getRequiredLevel("POST /api/user/create")).thenReturn(1);

        PermissionChecker checker = new PermissionChecker(userRepository, rolePermissionRepository, provider);

        UserModel viewer = new UserModel();
        viewer.setUserId("viewer-1");
        viewer.setRoleId(UserRole.VIEWER.getRoleId());
        Authentication auth = new UsernamePasswordAuthenticationToken(viewer, null, List.of());

        assertTrue(checker.checkPermission(auth, "POST", "/api/user/create"));
    }

    private PermissionConfigProvider.EndpointPermissions endpointPermissions(
            List<String> roles, Map<String, Integer> custom, int requiredLevel) {
        return new PermissionConfigProvider.EndpointPermissions() {
            @Override public List<String> getPermissions() { return roles; }
            @Override public Map<String, Integer> getCustom() { return custom; }
            @Override public void setPermissions(List<String> permissions) {}
            @Override public void setCustom(Map<String, Integer> customPermissions) {}
            @Override public int getRequiredLevelForCustomRole(String role) { return requiredLevel; }
            @Override public int getRequiredLevel() { return requiredLevel; }
            @Override public int getDefaultLevel() { return requiredLevel; }
        };
    }
}
