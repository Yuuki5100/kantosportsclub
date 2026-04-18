package com.example.appserver.config;

import com.example.appserver.filter.LoggingFilter;
import com.example.appserver.interceptor.AuthorizationInterceptor;
import com.example.appserver.interceptor.RequirePermissionInterceptor;
import com.example.appserver.interceptor.RequestInterceptor;
import jakarta.servlet.Filter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistration;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class WebConfigTest {

    @Mock
    private AuthorizationInterceptor authorizationInterceptor;

    @Mock
    private RequirePermissionInterceptor requirePermissionInterceptor;

    @Mock
    private RequestInterceptor requestInterceptor;

    @Mock
    private AuthorizationInterceptorProperties authzProps;

    @Mock
    private AuthorizationModeProperties authorizationModeProperties;

    @Mock
    private InterceptorRegistry interceptorRegistry;

    @Mock
    private InterceptorRegistration interceptorRegistration;

    private WebConfig webConfig;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        // paths を返すように設定（WebConfigのexcludePathPatternsに渡される）
        when(authzProps.getExcludePaths()).thenReturn(List.of( // TODO 3vikram
                "/auth/**",
                "/error"
        ));

        webConfig = new WebConfig(
                authorizationInterceptor,
                requirePermissionInterceptor,
                requestInterceptor,
                authzProps,
                authorizationModeProperties
        );
    }

    // ----------------------------------------------------------
    // loggingFilter() Bean 生成テスト
    // ----------------------------------------------------------
    @Test
    void testLoggingFilterBeanCreation() {
        FilterRegistrationBean<Filter> registration = webConfig.loggingFilter();
        assertNotNull(registration);
        assertNotNull(registration.getFilter());
        assertTrue(registration.getFilter() instanceof LoggingFilter,
                "loggingFilter() should register a LoggingFilter instance");
    }

    // ----------------------------------------------------------
    // addInterceptors() の登録確認テスト
    // ----------------------------------------------------------
    @Test
    void testAddInterceptors() {
        // Mock chain setup for interceptor registration
        when(interceptorRegistry.addInterceptor(any())).thenReturn(interceptorRegistration);
        when(interceptorRegistration.addPathPatterns(any(String[].class))).thenReturn(interceptorRegistration);
        when(interceptorRegistration.excludePathPatterns(any(String[].class))).thenReturn(interceptorRegistration);
        when(authorizationModeProperties.isLegacyInterceptorEnabled()).thenReturn(true);

        webConfig.addInterceptors(interceptorRegistry);

        // AuthorizationInterceptor が登録されているか
        verify(interceptorRegistry, atLeastOnce()).addInterceptor(eq(authorizationInterceptor));

        // RequestInterceptor が登録されているか（new ではなく注入されたインスタンス）
        verify(interceptorRegistry, atLeastOnce()).addInterceptor(eq(requestInterceptor));

        // excludePathPatterns が呼ばれているか（Properties由来）
        verify(interceptorRegistration, atLeastOnce()).excludePathPatterns(any(String[].class));
    }

    @Test
    void testAddInterceptors_WhenLegacyDisabled_AuthorizationInterceptorNotRegistered() {
        when(interceptorRegistry.addInterceptor(any())).thenReturn(interceptorRegistration);
        when(interceptorRegistration.addPathPatterns(any(String[].class))).thenReturn(interceptorRegistration);
        when(interceptorRegistration.excludePathPatterns(any(String[].class))).thenReturn(interceptorRegistration);
        when(authorizationModeProperties.isLegacyInterceptorEnabled()).thenReturn(false);

        webConfig.addInterceptors(interceptorRegistry);

        verify(interceptorRegistry, never()).addInterceptor(eq(authorizationInterceptor));
        verify(interceptorRegistry, atLeastOnce()).addInterceptor(eq(requirePermissionInterceptor));
        verify(interceptorRegistry, atLeastOnce()).addInterceptor(eq(requestInterceptor));
    }
}
