package com.example.syncconnector.config;

import com.example.syncconnector.interceptor.SyncSignatureVerificationInterceptor;
import com.example.syncconnector.signature.HmacSigner;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;

class SyncSignatureVerificationConfigTest {

    @Test
    void addInterceptors_shouldRegisterInterceptor_whenEnabled() {
        SyncSignatureProperties props = new SyncSignatureProperties();
        props.setEnabled(true);
        props.setSecret("test-secret");
        props.setTargetPaths(List.of("/api/**")); // ✅ OK

        InterceptorRegistry registry = mock(InterceptorRegistry.class);

        SyncSignatureVerificationConfig config = new SyncSignatureVerificationConfig(props);
        config.addInterceptors(registry);

        // registry.addInterceptor が呼ばれたか確認（引数は Interceptor の型で）
        verify(registry).addInterceptor(any(SyncSignatureVerificationInterceptor.class));
    }

    @Test
    void addInterceptors_shouldNotRegisterInterceptor_whenDisabled() {
        SyncSignatureProperties props = new SyncSignatureProperties();
        props.setEnabled(false);

        InterceptorRegistry registry = mock(InterceptorRegistry.class);

        SyncSignatureVerificationConfig config = new SyncSignatureVerificationConfig(props);
        config.addInterceptors(registry);

        // 呼ばれていないこと
        verify(registry, never()).addInterceptor(any());
    }

    @Test
    void requestBodyCachingFilter_shouldWrapRequestCorrectly() {
        SyncSignatureProperties props = new SyncSignatureProperties();
        SyncSignatureVerificationConfig config = new SyncSignatureVerificationConfig(props);

        FilterRegistrationBean<OncePerRequestFilter> bean = config.requestBodyCachingFilter();

        assertNotNull(bean);
        assertEquals(0, bean.getOrder());
        assertTrue(bean.getFilter() instanceof OncePerRequestFilter);
    }
}
