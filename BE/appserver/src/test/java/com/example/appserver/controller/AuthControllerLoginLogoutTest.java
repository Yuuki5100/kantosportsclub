package com.example.appserver.controller;

import com.example.appserver.request.auth.LoginRequest;
import com.example.appserver.security.OidcTokenValidator;
import com.example.appserver.security.PermissionChecker;
import com.example.appserver.security.JwtTokenProvider;
import com.example.appserver.security.CustomUserDetailsService;
import com.example.appserver.security.cookie.RefreshTokenCookieResolver;
import com.example.appserver.service.AuthService;
import com.example.appserver.service.ExternalAuthClient;
import com.example.appserver.config.AuthorizationInterceptorProperties;
import jakarta.persistence.EntityManagerFactory;
import com.example.servercommon.exception.GlobalExceptionHandler;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.ErrorCodeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Locale;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
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
class AuthControllerLoginLogoutTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private ExternalAuthClient externalAuthClient;

    @MockBean
    private OidcTokenValidator oidcTokenValidator;

    @MockBean
    private RefreshTokenCookieResolver refreshTokenCookieResolver;

    @MockBean
    private PermissionChecker permissionChecker;

    @MockBean
    private AuthorizationInterceptorProperties authorizationInterceptorProperties;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean(name = "entityManagerFactory")
    private EntityManagerFactory entityManagerFactory;

    @MockBean
    private ErrorCodeService errorCodeService;

    @MockBean
    private TeamsNotificationService teamsNotificationService;

    @BeforeEach
    void setup() {
        Mockito.lenient()
                .when(errorCodeService.getErrorMessage(anyString(), anyString()))
                .thenReturn("Validation error");
    }

    @Test
    void SC01_UT_001_shouldReturnOkAndTokenWhenCredentialsValid() throws Exception {
        LoginRequest req = new LoginRequest("user1", "pass1");

        ResponseEntity<ApiResponse<?>> response = ResponseEntity.ok()
                .header("Set-Cookie", "ACCESS_TOKEN=token123; Path=/; HttpOnly")
                .body(ApiResponse.success(Map.of("authenticated", true)));

        when(authService.login(eq("user1"), eq("pass1"),
                any(HttpServletRequest.class),
                any(jakarta.servlet.http.HttpServletResponse.class),
                any(Locale.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", containsString("ACCESS_TOKEN=")))
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.authenticated", is(true)));
    }

    @Test
    void SC01_UT_002_shouldReturnBadRequestWhenMissingUserId() throws Exception {
        String body = "{\"password\":\"pass1\"}";

        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("E4001")))
                .andExpect(jsonPath("$.error.message", containsString("user_id")));
    }

    @Test
    void SC01_UT_003_shouldReturnBadRequestWhenMissingPassword() throws Exception {
        String body = "{\"user_id\":\"user1\"}";

        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("E4001")))
                .andExpect(jsonPath("$.error.message", containsString("password")));
    }

    @Test
    void SC01_UT_004_shouldReturnUnauthorizedWhenPasswordInvalid() throws Exception {
        LoginRequest req = new LoginRequest("user1", "wrong");

        when(authService.login(eq("user1"), eq("wrong"),
                any(HttpServletRequest.class),
                any(jakarta.servlet.http.HttpServletResponse.class),
                any(Locale.class)))
                .thenReturn(ResponseEntity.status(401)
                        .body(ApiResponse.error(BackendMessageCatalog.CODE_E401, BackendMessageCatalog.MSG_UNAUTHORIZED)));

        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("E401")));
    }

    @Test
    void SC01_UT_005_shouldReturnUnauthorizedWhenUserNotFound() throws Exception {
        LoginRequest req = new LoginRequest("missing", "pass");

        when(authService.login(eq("missing"), eq("pass"),
                any(HttpServletRequest.class),
                any(jakarta.servlet.http.HttpServletResponse.class),
                any(Locale.class)))
                .thenReturn(ResponseEntity.status(401)
                        .body(ApiResponse.error(BackendMessageCatalog.CODE_E401, BackendMessageCatalog.MSG_UNAUTHORIZED)));

        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("E401")));
    }
    @Test
    void SC01_UT_006_shouldReturnForbiddenWhenUserDisabled() throws Exception {
        LoginRequest req = new LoginRequest("disabled", "pass1");

        when(authService.login(eq("disabled"), eq("pass1"),
                any(HttpServletRequest.class),
                any(jakarta.servlet.http.HttpServletResponse.class),
                any(Locale.class)))
                .thenReturn(ResponseEntity.status(403)
                        .body(ApiResponse.error(BackendMessageCatalog.CODE_E403, BackendMessageCatalog.MSG_ACCESS_DENIED)));

        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("E403")));
    }

    @Test
    void SC01_UT_007_shouldReturnForbiddenWhenUserLocked() throws Exception {
        LoginRequest req = new LoginRequest("locked", "pass1");

        when(authService.login(eq("locked"), eq("pass1"),
                any(HttpServletRequest.class),
                any(jakarta.servlet.http.HttpServletResponse.class),
                any(Locale.class)))
                .thenReturn(ResponseEntity.status(403)
                        .body(ApiResponse.error(BackendMessageCatalog.CODE_E403, BackendMessageCatalog.MSG_ACCESS_DENIED)));

        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("E403")));
    }

    @Test
    void SC01_UT_029_shouldReturnCorrectErrorWhenAccountLocked() throws Exception {
        LoginRequest req = new LoginRequest("locked-user", "correct-pass");

        when(authService.login(eq("locked-user"), eq("correct-pass"),
                any(HttpServletRequest.class),
                any(jakarta.servlet.http.HttpServletResponse.class),
                any(Locale.class)))
                .thenReturn(ResponseEntity.status(403)
                        .body(ApiResponse.error(BackendMessageCatalog.CODE_E403, BackendMessageCatalog.MSG_ACCOUNT_LOCKED)));

        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code", is("E403")));
    }
}
