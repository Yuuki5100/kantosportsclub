package com.example.batchserver.config;

import java.io.IOException;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        .anyRequest().authenticated()) // 認証が必要 → GatewayTokenFilter で代替
                .addFilterBefore(new GatewayTokenFilter(), UsernamePasswordAuthenticationFilter.class)
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(formLogin -> formLogin.disable());

        return http.build();
    }

    /**
     * Gateway 経由のリクエストかどうかを検査するフィルタ
     */
    public class GatewayTokenFilter extends OncePerRequestFilter {

        private static final String HEADER_NAME = "X-Gateway-Token";
        private static final String EXPECTED_VALUE = "trusted";

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain)
                throws ServletException, IOException {

            String headerValue = request.getHeader(HEADER_NAME);
            if (!EXPECTED_VALUE.equals(headerValue)) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access only allowed via Gateway");
                return;
            }

            String token = request.getHeader("Authorization").replace("Bearer ", "");
            String username = jwtTokenProvider.getUsernameFromJWT(token);
            List<GrantedAuthority> authorities = jwtTokenProvider.getAuthoritiesFromJWT(token);
            // 疑似的な認証をセット（必要な場合のみ）
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    username, null, authorities // 空の権限でもOK
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

            filterChain.doFilter(request, response);
        }
    }
}
