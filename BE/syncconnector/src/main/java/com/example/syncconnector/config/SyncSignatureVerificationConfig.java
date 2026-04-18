package com.example.syncconnector.config;

import com.example.syncconnector.interceptor.SyncSignatureVerificationInterceptor;
import com.example.syncconnector.signature.HmacSigner;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;



/**
 * 署名検証のための Interceptor / Filter を登録する設定クラス。
 *
 * <p>主に受信リクエストに対して {@link com.example.syncconnector.interceptor.SyncSignatureVerificationInterceptor} を有効化し、
 * リクエストボディのキャッシュ用に {@link ContentCachingRequestWrapper} を適用する Filter を同時に登録します。</p>
 */
@Configuration
@RequiredArgsConstructor
public class SyncSignatureVerificationConfig implements WebMvcConfigurer {

    private final SyncSignatureProperties signatureProperties;

    /**
     * InterceptorRegistry に署名検証用の Interceptor を登録。
     *
     * @param registry Springの InterceptorRegistry
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        if (signatureProperties.isEnabled()) {
            registry.addInterceptor(
                new SyncSignatureVerificationInterceptor(
                    new HmacSigner(signatureProperties.resolveSecret()),
                    signatureProperties.getTargetPaths(),
                    signatureProperties.getSignatureHeader()
                )
            );
        }
    }

    /**
     * リクエストボディを再読み込み可能にする {@link ContentCachingRequestWrapper} を適用する Filter。
     *
     * <p>この Filter が Interceptor より前段に適用される必要があります。</p>
     */
    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> requestBodyCachingFilter() {
        FilterRegistrationBean<OncePerRequestFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(
                HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain
            ) throws ServletException, IOException {
                filterChain.doFilter(new ContentCachingRequestWrapper(request), response);
            }
        });
        registrationBean.setOrder(0); // Interceptorより前段に挿入
        return registrationBean;
    }
}
