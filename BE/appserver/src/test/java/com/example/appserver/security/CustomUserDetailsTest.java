package com.example.appserver.security;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.HashMap;
import java.util.Map;
import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

class CustomUserDetailsTest {

    private UserModel user;
    private Map<Integer, Integer> rolePermissions;
    private CustomUserDetails userDetails;

    @BeforeEach
    void setUp() {
        user = new UserModel();
        user.setUserId("testuser");
        user.setPassword("password123");
        user.setRoleId(UserRole.SYSTEM_ADMIN.getRoleId());

        rolePermissions = new HashMap<>();
        rolePermissions.put(101, 2);
        rolePermissions.put(201, 3);

        userDetails = new CustomUserDetails(user, rolePermissions);
    }

    @Test
    void getDomainUser_ShouldReturnUser() {
        assertEquals(user, userDetails.getDomainUser());
    }

    @Test
    void getRolePermissions_ShouldReturnPermissionsMap() {
        assertEquals(rolePermissions, userDetails.getRolePermissions());
        assertEquals(2, userDetails.getRolePermissions().get(101));
    }

    @Test
    void getAuthorities_ShouldReturnCorrectRole() {
        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        assertEquals(1, authorities.size());
        assertEquals("ROLE_SYSTEM_ADMIN", authorities.iterator().next().getAuthority());
    }

    @Test
    void getUsername_ShouldReturnUsername() {
        assertEquals("testuser", userDetails.getUsername());
    }

    @Test
    void getPassword_ShouldReturnPassword() {
        assertEquals("password123", userDetails.getPassword());
    }

    @Test
    void accountStatusChecks_ShouldAlwaysReturnTrue() {
        assertTrue(userDetails.isAccountNonExpired());
        assertTrue(userDetails.isAccountNonLocked());
        assertTrue(userDetails.isCredentialsNonExpired());
        assertTrue(userDetails.isEnabled());
    }

    @Test
    void getAuthorities_ShouldReturnEmptyWhenRoleIsNull() {
        user.setRoleId(null);
        CustomUserDetails detailsWithNullRole = new CustomUserDetails(user, rolePermissions);
        assertTrue(detailsWithNullRole.getAuthorities().isEmpty());
    }
}
