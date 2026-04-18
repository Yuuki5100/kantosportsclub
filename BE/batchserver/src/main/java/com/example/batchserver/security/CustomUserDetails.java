package com.example.batchserver.security;

import com.example.servercommon.model.UserModel;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Map;

public class CustomUserDetails implements UserDetails {

    private final UserModel user;
    private final Map<String, Integer> rolePermissions; // エンドポイントごとの権限情報

    public CustomUserDetails(UserModel user, Map<String, Integer> rolePermissions) {
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
        // UserModelが roleId 管理の場合、ここで enum へ戻せないと Authority を作れない。
        // バッチ側で権限を使わないなら空でOK。
        return java.util.Collections.emptyList();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    // Spring Security の username = ログイン識別子。今回は userId を返す。
    @Override
    public String getUsername() {
        return user.getUserId();
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
