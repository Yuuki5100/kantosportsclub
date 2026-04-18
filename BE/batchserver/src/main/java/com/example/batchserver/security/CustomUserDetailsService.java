package com.example.batchserver.security;

import com.example.servercommon.model.UserModel;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Map;

public class CustomUserDetailsService implements UserDetails {

    private final UserModel user;
    private final Map<String, Integer> rolePermissions;

    public CustomUserDetailsService(UserModel user, Map<String, Integer> rolePermissions) {
        this.user = user;
        this.rolePermissions = rolePermissions;
    }

    public UserModel getDomainUser() {
        return user;
    }

    public Map<String, Integer> getRolePermissions() {
        return rolePermissions;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // UserModel 側の role 表現が roleId の場合、ここは一旦空でOK（バッチが権限使わないなら）
        // もし "ROLE_VIEWER" 等が必要なら roleId -> enum 変換ロジックを別途用意して詰める
        return java.util.Collections.emptyList();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    // Spring Security の username = login識別子。今回は userId を返す。
    @Override
    public String getUsername() {
        return user.getUserId();
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
