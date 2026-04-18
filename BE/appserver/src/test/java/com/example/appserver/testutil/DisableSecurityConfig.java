package com.example.appserver.testutil;

import com.example.appserver.security.PermissionChecker;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;

import static org.mockito.ArgumentMatchers.*;

@Configuration
public class DisableSecurityConfig {

    @Bean
    public PermissionChecker permissionChecker() {
        PermissionChecker mock = Mockito.mock(PermissionChecker.class);

        // ✅ メソッド名は checkPermission にすること！
        Mockito.when(mock.checkPermission(any(Authentication.class), anyString(), anyString()))
                .thenReturn(true);

        return mock;
    }
}
