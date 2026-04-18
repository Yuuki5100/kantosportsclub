package com.example.appserver.config;

import com.example.appserver.filter.LoggingFilter;
import com.example.appserver.interceptor.AuthorizationInterceptor;
import com.example.appserver.interceptor.RequirePermissionInterceptor;
import com.example.appserver.interceptor.RequestInterceptor;
import jakarta.servlet.Filter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthorizationInterceptor authorizationInterceptor;
    private final RequirePermissionInterceptor requirePermissionInterceptor;
    private final RequestInterceptor requestInterceptor;
    private final AuthorizationInterceptorProperties authzProps;
    private final AuthorizationModeProperties authorizationModeProperties;

    public WebConfig(AuthorizationInterceptor authorizationInterceptor,
                     RequirePermissionInterceptor requirePermissionInterceptor,
                     RequestInterceptor requestInterceptor,
                     AuthorizationInterceptorProperties authzProps,
                     AuthorizationModeProperties authorizationModeProperties) {
        this.authorizationInterceptor = authorizationInterceptor;
        this.requirePermissionInterceptor = requirePermissionInterceptor;
        this.requestInterceptor = requestInterceptor;
        this.authzProps = authzProps;
        this.authorizationModeProperties = authorizationModeProperties;
    }

    @Bean
    public FilterRegistrationBean<Filter> loggingFilter() {
        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new LoggingFilter());
        registration.setOrder(-101);
        return registration;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(requirePermissionInterceptor)
                .addPathPatterns("/**");

        if (authorizationModeProperties.isLegacyInterceptorEnabled()) {
            registry.addInterceptor(authorizationInterceptor)
                    .addPathPatterns("/**")
                    .excludePathPatterns(authzProps.getExcludePaths().toArray(new String[0]));
        }

        registry.addInterceptor(requestInterceptor)
                .addPathPatterns("/**");
    }
}
