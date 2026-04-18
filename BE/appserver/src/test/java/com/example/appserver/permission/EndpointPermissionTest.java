package com.example.appserver.permission;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class EndpointPermissionTest {

    @Test
    void getRequiredLevel_ShouldReturnSizeOfAllowedRoles() {
        List<String> roles = Arrays.asList("USER", "ADMIN", "VIEWER");
        Map<String, Integer> customPermissions = new HashMap<>();
        customPermissions.put("user", 2);

        EndpointPermission permission = new EndpointPermission(
                "/user/profile",
                2,
                roles,
                customPermissions
        );

        int requiredLevel = permission.getRequiredLevel();
        assertEquals(3, requiredLevel, "getRequiredLevel should return the size of allowedRoles");
    }

    @Test
    void getRequiredLevel_WhenAllowedRolesIsNull_ShouldReturnZero() {
        EndpointPermission permission = new EndpointPermission(
                "/user/profile",
                2,
                null,
                null
        );

        int requiredLevel = permission.getRequiredLevel();
        assertEquals(0, requiredLevel, "getRequiredLevel should return 0 if allowedRoles is null");
    }

    @Test
    void constructorAndGetters_ShouldWorkCorrectly() {
        List<String> roles = Arrays.asList("USER", "ADMIN");
        Map<String, Integer> customPermissions = Map.of("admin", 5);

        EndpointPermission permission = new EndpointPermission(
                "/admin/dashboard",
                5,
                roles,
                customPermissions
        );

        assertEquals("/admin/dashboard", permission.getEndpoint());
        assertEquals(5, permission.getDefaultLevel());
        assertEquals(roles, permission.getAllowedRoles());
        assertEquals(customPermissions, permission.getCustomPermissions());
    }

    @Test
    void setters_ShouldWorkCorrectly() {
        EndpointPermission permission = new EndpointPermission();

        permission.setEndpoint("/new/endpoint");
        permission.setDefaultLevel(1);
        permission.setAllowedRoles(Arrays.asList("GUEST"));
        permission.setCustomPermissions(Map.of("guest", 1));

        assertEquals("/new/endpoint", permission.getEndpoint());
        assertEquals(1, permission.getDefaultLevel());
        assertEquals(1, permission.getAllowedRoles().size());
        assertEquals(1, permission.getCustomPermissions().get("guest"));
    }
}
