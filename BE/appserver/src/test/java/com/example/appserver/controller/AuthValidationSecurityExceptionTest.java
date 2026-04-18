package com.example.appserver.controller;

import com.example.appserver.config.AuthorizationInterceptorProperties;
import com.example.appserver.security.CustomUserDetailsService;
import com.example.appserver.security.JwtTokenProvider;
import com.example.appserver.security.OidcTokenValidator;
import com.example.appserver.security.PermissionChecker;
import com.example.appserver.security.cookie.RefreshTokenCookieResolver;
import com.example.appserver.service.AuthService;
import com.example.appserver.service.ExternalAuthClient;
import com.example.servercommon.exception.GlobalExceptionHandler;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.ErrorCodeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManagerFactory;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Locale;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = AuthController.class,
        excludeAutoConfiguration = {
                DataSourceAutoConfiguration.class,
                HibernateJpaAutoConfiguration.class,
                JpaRepositoriesAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {AuthController.class, GlobalExceptionHandler.class})
@Import(GlobalExceptionHandler.class)
@ExtendWith(OutputCaptureExtension.class)
@DisplayName("Auth Validation/Security/ExceptionHandler tests")
class AuthValidationSecurityExceptionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ---- Controller deps ----
    @MockBean private AuthService authService;
    @MockBean private ExternalAuthClient externalAuthClient;
    @MockBean private OidcTokenValidator oidcTokenValidator;
    @MockBean private RefreshTokenCookieResolver refreshTokenCookieResolver;

    // ---- Interceptor/security deps present in your project ----
    @MockBean private PermissionChecker permissionChecker;
    @MockBean private AuthorizationInterceptorProperties authorizationInterceptorProperties;
    @MockBean private JwtTokenProvider jwtTokenProvider;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @MockBean(name = "entityManagerFactory")
    private EntityManagerFactory entityManagerFactory;

    @MockBean private ErrorCodeService errorCodeService;
    @MockBean private TeamsNotificationService teamsNotificationService;

    @BeforeEach
    void setup() {
        // Validation error message resolution (if GlobalExceptionHandler uses this)
        Mockito.lenient()
                .when(errorCodeService.getErrorMessage(anyString(), anyString()))
                .thenReturn("Validation error");

        // Allow AuthorizationInterceptor to pass through (method/uri permission check)
        Mockito.lenient()
                .when(permissionChecker.checkPermission(any(), anyString(), anyString()))
                .thenReturn(true);
    }


    // 26
    @Test
    @DisplayName("SC01-UT-033 shouldBlockXssLikePayloadInIdentifierFields")
    void shouldBlockXssLikePayloadInIdentifierFields() throws Exception {
        String body = "{\"user_id\":\"<script>alert(1)</script>\",\"password\":\"pass\"}";

        when(authService.login(anyString(), anyString(),
                any(HttpServletRequest.class),
                any(jakarta.servlet.http.HttpServletResponse.class),
                any(Locale.class)))
                .thenReturn(ResponseEntity.status(401)
                        .body(ApiResponse.error(BackendMessageCatalog.CODE_E401, BackendMessageCatalog.MSG_UNAUTHORIZED)));

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(not(containsString("<script>"))));
    }

    // 27
    @Test
    @DisplayName("SC01-UT-034 shouldPreventSqlInjectionLikePayload")
    void shouldPreventSqlInjectionLikePayload() throws Exception {
        String body = "{\"user_id\":\"' OR 1=1 --\",\"password\":\"pass\"}";

        when(authService.login(anyString(), anyString(),
                any(HttpServletRequest.class),
                any(jakarta.servlet.http.HttpServletResponse.class),
                any(Locale.class)))
                .thenReturn(ResponseEntity.status(401)
                        .body(ApiResponse.error(BackendMessageCatalog.CODE_E401, BackendMessageCatalog.MSG_UNAUTHORIZED)));

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                // no SQL/stacktrace leakage
                .andExpect(content().string(not(containsString("SELECT"))))
                .andExpect(content().string(not(containsString("SQLSTATE"))))
                .andExpect(content().string(not(containsString("Exception"))));
    }

    // 28
    @Test
    @DisplayName("SC01-UT-035 shouldWriteErrorLogOnUnhandledException")
    void shouldWriteErrorLogOnUnhandledException(CapturedOutput output) throws Exception {
        when(authService.login(anyString(), anyString(),
                any(HttpServletRequest.class),
                any(jakarta.servlet.http.HttpServletResponse.class),
                any(Locale.class)))
                .thenThrow(new RuntimeException("boom"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"user_id\":\"user1\",\"password\":\"pass1\"}"))
                .andExpect(status().is5xxServerError());

        // log should contain exception info (adjust if your logger format differs)
        boolean found = output.getOut().contains("boom") || output.getErr().contains("boom");
        org.junit.jupiter.api.Assertions.assertTrue(found, "Expected log output to contain exception message");
    }

    // 29
    @Test
    @DisplayName("SC01-UT-036 shouldNotLeakSensitiveInfoInErrorMessage")
    void shouldNotLeakSensitiveInfoInErrorMessage() throws Exception {
        when(authService.login(anyString(), anyString(),
                any(HttpServletRequest.class),
                any(jakarta.servlet.http.HttpServletResponse.class),
                any(Locale.class)))
                .thenThrow(new RuntimeException("SQLSTATE 42000 SELECT * FROM users"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"user_id\":\"user1\",\"password\":\"pass1\"}"))
                .andExpect(status().is5xxServerError())
                // response must not leak SQL/stacktrace
                .andExpect(content().string(not(containsString("SELECT"))))
                .andExpect(content().string(not(containsString("SQLSTATE"))))
                .andExpect(content().string(not(containsString("org."))))
                .andExpect(content().string(not(containsString(" at "))))
                .andExpect(content().string(not(containsString("Exception"))));
    }
}
