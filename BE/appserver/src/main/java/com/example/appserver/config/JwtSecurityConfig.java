package com.example.appserver.config;

import com.example.appserver.filter.TokenRefreshFilter;
import com.example.appserver.security.CustomUserDetailsService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.NullSecurityContextRepository;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@ConditionalOnProperty(name = "security.auth.mode", havingValue = "jwt", matchIfMissing = true)
public class JwtSecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final TokenRefreshFilter tokenRefreshFilter;
    private final SecurityConfigSupport securityConfigSupport;

    public JwtSecurityConfig(CustomUserDetailsService customUserDetailsService,
            TokenRefreshFilter tokenRefreshFilter,
            SecurityConfigSupport securityConfigSupport) {
        this.customUserDetailsService = customUserDetailsService;
        this.tokenRefreshFilter = tokenRefreshFilter;
        this.securityConfigSupport = securityConfigSupport;
    }

    @SuppressWarnings("removal")
    @Bean
    public SecurityFilterChain jwtSecurityFilterChain(HttpSecurity http) throws Exception {
        securityConfigSupport.applyCommon(http);

        http
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(tokenRefreshFilter, UsernamePasswordAuthenticationFilter.class)
            .securityContext(sc -> sc.securityContextRepository(new NullSecurityContextRepository()))
            .userDetailsService(customUserDetailsService);

        return http.build();
    }
}
