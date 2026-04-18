package com.example.appserver.security;

import com.example.appserver.config.AuthorizationInterceptorProperties;
import com.example.appserver.config.CorsConfig;
import com.example.appserver.config.JwtSecurityConfig;
import com.example.appserver.config.SecurityConfigSupport;
import com.example.appserver.controller.AuthController;
import com.example.appserver.filter.TokenRefreshFilter;
import com.example.appserver.security.cookie.AuthCookieUtil;
import com.example.appserver.security.cookie.RefreshTokenCookieResolver;
import com.example.appserver.service.AuthService;
import com.example.appserver.service.ExternalAuthClient;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.repository.AuthRefreshTokenRepository;
import com.example.servercommon.responseModel.ApiResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.impl.DefaultClaims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.batch.BatchAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        classes = AuthLogoutSecurityTest.TestApp.class,
        properties = "jwt.access.expiration-ms=3600000"
)
@AutoConfigureMockMvc
class AuthLogoutSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @SuppressWarnings("removal")
    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @SuppressWarnings("removal")
    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @SuppressWarnings("removal")
    @MockBean
    private AuthService authService;

    @SuppressWarnings("removal")
    @MockBean
    private ExternalAuthClient externalAuthClient;

    @SuppressWarnings("removal")
    @MockBean
    private OidcTokenValidator oidcTokenValidator;

    @SuppressWarnings("removal")
    @MockBean
    private RefreshTokenCookieResolver refreshTokenCookieResolver;

    @SuppressWarnings("removal")
    @MockBean
    private AuthorizationInterceptorProperties authorizationInterceptorProperties;

    @SuppressWarnings("removal")
    @MockBean
    private AuthenticationEntryPoint authenticationEntryPoint;

    @SuppressWarnings("removal")
    @MockBean
    private AccessDeniedHandler accessDeniedHandler;

    @SuppressWarnings("removal")
    @MockBean
    private AuthRefreshTokenRepository authRefreshTokenRepository;

    @SuppressWarnings("removal")
    @MockBean
    private AuthCookieUtil authCookieUtil;

    @SuppressWarnings("removal")
    @MockBean
    private BackendMessageResolver backendMessageResolver;

    @BeforeEach
    void setUp() {
        when(authorizationInterceptorProperties.getExcludePaths()).thenReturn(List.of("/api/auth/login"));
    }

    @Test
    void SC01_UT_008_shouldReturnOkWhenTokenValid() throws Exception {
        Claims claims = new DefaultClaims();
        claims.setSubject("user1");
        claims.put("typ", "access");

        when(jwtTokenProvider.parseClaims("good")).thenReturn(claims);

        UserModel user = new UserModel();
        user.setUserId("user1");

        CustomUserDetails details = new CustomUserDetails(user, Map.of());
        when(customUserDetailsService.loadUserByUsername("user1")).thenReturn(details);

        when(authService.logout(any(), any()))
                .thenReturn(ResponseEntity.ok(ApiResponse.success("OK")));

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer good"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("OK"));
    }

    @Test
    void SC01_UT_009_shouldReturnUnauthorizedWhenNoToken() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized());

        verify(authService, never()).logout(any(), any());
    }

    @Test
    void SC01_UT_010_shouldReturnUnauthorizedWhenTokenInvalid() throws Exception {
        when(jwtTokenProvider.parseClaims("bad"))
                .thenThrow(new JwtException("invalid"));

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer bad"))
                .andExpect(status().isUnauthorized());

        verify(authService, never()).logout(any(), any());
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            JpaRepositoriesAutoConfiguration.class,
            BatchAutoConfiguration.class
    })
    @Import({
            AuthController.class,
            JwtSecurityConfig.class,
            SecurityConfigSupport.class,
            TokenRefreshFilter.class,
            CorsConfig.class
    })
    static class TestApp {
    }
}
