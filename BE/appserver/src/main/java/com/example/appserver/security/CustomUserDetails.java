package com.example.appserver.security;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Map;

public class CustomUserDetails implements UserDetails {
    private final UserModel user;
    private final Map<Integer, Integer> rolePermissions;

    public CustomUserDetails(UserModel user, Map<Integer, Integer> rolePermissions) {
        this.user = user;
        this.rolePermissions = rolePermissions;
    }

    public UserModel getDomainUser() {
        return user;
    }

    public Map<Integer, Integer> getRolePermissions() {
        return rolePermissions;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Integer roleId = user.getRoleId();
        if (roleId == null) return java.util.Collections.emptyList();

        String roleName = resolveRoleName();
        String authority = (roleName != null && !roleName.isBlank())
                ? "ROLE_" + roleName
                : "ROLE_" + roleId;
        return java.util.Collections.singletonList((GrantedAuthority) () -> authority);
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    // ログイン識別子は userId（String）
    @Override
    public String getUsername() {
        return user.getUserId();
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    private String resolveRoleName() {
        Integer roleId = user.getRoleId();
        if (roleId == null) return null;

        for (UserRole r : UserRole.values()) {
            if (r.getRoleId() == roleId) {
                return r.name();
            }
        }
        return null;
    }
}
