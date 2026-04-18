package com.example.appserver.config;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SecurityConfigSupport {

    private final AuthorizationInterceptorProperties allowlistProps;
    private final AuthenticationEntryPoint authenticationEntryPoint;
    private final AccessDeniedHandler accessDeniedHandler;

    public SecurityConfigSupport(AuthorizationInterceptorProperties allowlistProps,
                                 AuthenticationEntryPoint authenticationEntryPoint,
                                 AccessDeniedHandler accessDeniedHandler) {
        this.allowlistProps = allowlistProps;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    public void applyCommon(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {
            })
            .formLogin(form -> form.disable())
            .csrf(csrf -> csrf.disable())
            .logout(logout -> logout.disable())

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )

            .authorizeHttpRequests(auth -> {
                List<String> paths = allowlistProps.getExcludePaths(); // TODO 3vikram
                if (paths != null && !paths.isEmpty()) {
                    RequestMatcher[] matchers = paths.stream()
                        .map(AntPathRequestMatcher::new)
                        .toArray(RequestMatcher[]::new);
                    auth.requestMatchers(matchers).permitAll();
                }
                auth.anyRequest().authenticated();
            });
    }
}
