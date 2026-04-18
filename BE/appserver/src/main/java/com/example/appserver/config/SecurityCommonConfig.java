package com.example.appserver.config;

import com.example.appserver.filter.TokenRefreshFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SecurityCommonConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public FilterRegistrationBean<TokenRefreshFilter> tokenRefreshFilterRegistration(TokenRefreshFilter filter) {
        FilterRegistrationBean<TokenRefreshFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false); // Register only in SecurityFilterChain
        return registration;
    }
}
