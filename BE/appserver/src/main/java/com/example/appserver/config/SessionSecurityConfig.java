package com.example.appserver.config;

import com.example.appserver.filter.SessionCheckFilter;
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
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@ConditionalOnProperty(name = "security.auth.mode", havingValue = "session")
public class SessionSecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final SessionCheckFilter sessionCheckFilter;
    private final SecurityConfigSupport securityConfigSupport;

    public SessionSecurityConfig(CustomUserDetailsService customUserDetailsService,
                                 SessionCheckFilter sessionCheckFilter,
                                 SecurityConfigSupport securityConfigSupport) {
        this.customUserDetailsService = customUserDetailsService;
        this.sessionCheckFilter = sessionCheckFilter;
        this.securityConfigSupport = securityConfigSupport;
    }

    @SuppressWarnings("removal")
    @Bean
    public SecurityFilterChain sessionSecurityFilterChain(HttpSecurity http) throws Exception {
        securityConfigSupport.applyCommon(http);

        http
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .addFilterBefore(sessionCheckFilter, UsernamePasswordAuthenticationFilter.class)
            .securityContext(sc -> sc.securityContextRepository(new HttpSessionSecurityContextRepository()))
            .userDetailsService(customUserDetailsService);

        return http.build();
    }
}
