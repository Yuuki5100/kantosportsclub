package com.example.appserver.config;

import org.mockito.Mockito;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import com.example.appserver.security.PermissionChecker;

@TestConfiguration
public class MockPermissionCheckerConfig {
    @Bean
    @ConditionalOnMissingBean
    public PermissionChecker permissionChecker() {
        return Mockito.mock(PermissionChecker.class);
    }
}
