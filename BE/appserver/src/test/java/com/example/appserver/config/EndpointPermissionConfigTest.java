package com.example.appserver.config;

import static org.junit.jupiter.api.Assertions.*;

import com.example.appserver.permission.EndpointPermission;
import com.example.appserver.permission.EndpointPermissionConfig;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

class EndpointPermissionConfigTest {

    @Test
    void testEndpointPermissionsBean() {
        EndpointPermissionConfig config = new EndpointPermissionConfig();
        Map<String, EndpointPermission> map = config.endpointPermissions();

        assertNotNull(map);
        assertEquals(5, map.size(), "Map should contain 5 endpoints");

        // /user/profile
        EndpointPermission userProfile = map.get("/user/profile");
        assertNotNull(userProfile);
        assertEquals(2, userProfile.getDefaultLevel());
        assertEquals(List.of("USER", "ADMIN", "VIEWER"), userProfile.getAllowedRoles());
        assertEquals(Map.of("USER", 2), userProfile.getCustomPermissions());

        // /admin/dashboard
        EndpointPermission adminDashboard = map.get("/admin/dashboard");
        assertNotNull(adminDashboard);
        assertEquals(1, adminDashboard.getDefaultLevel());
        assertEquals(List.of("ADMIN", "USER"), adminDashboard.getAllowedRoles());
        assertEquals(Map.of("ADMIN", 1), adminDashboard.getCustomPermissions());

        // /product/details
        EndpointPermission productDetails = map.get("/product/details");
        assertNotNull(productDetails);
        assertEquals(1, productDetails.getDefaultLevel());
        assertEquals(List.of("USER", "ADMIN", "VIEWER"), productDetails.getAllowedRoles());
        assertEquals(Map.of("USER", 1), productDetails.getCustomPermissions());

        // /user/list
        EndpointPermission userList = map.get("/user/list");
        assertNotNull(userList);
        assertEquals(1, userList.getDefaultLevel());
        assertEquals(List.of("USER"), userList.getAllowedRoles());
        assertEquals(Map.of("USER", 3), userList.getCustomPermissions());

        // /api/system
        EndpointPermission settings = map.get("/api/system");
        assertNotNull(settings);
        assertEquals(1, settings.getDefaultLevel());
        assertEquals(List.of("USER", "ADMIN"), settings.getAllowedRoles());
        assertEquals(Map.of("USER", 3), settings.getCustomPermissions());
    }
}
