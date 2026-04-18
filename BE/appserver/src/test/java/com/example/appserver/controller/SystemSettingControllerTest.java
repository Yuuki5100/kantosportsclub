package com.example.appserver.controller;

import com.example.appserver.config.AuthorizationInterceptorProperties;
import com.example.appserver.interceptor.RequirePermissionInterceptor;
import com.example.appserver.request.system.SystemSettingUpdateRequest;
import com.example.appserver.response.system.SystemSettingData;
import com.example.appserver.response.system.SystemSettingItem;
import com.example.appserver.security.AuthChecker;
import com.example.appserver.security.CustomUserDetails;
import com.example.appserver.security.RolePermissionChecker;
import com.example.appserver.service.SystemSettingService;
import com.example.servercommon.exception.GlobalExceptionHandler;
import com.example.servercommon.model.SystemSetting;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.service.ErrorCodeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = SystemSettingController.class,
        excludeAutoConfiguration = {
                DataSourceAutoConfiguration.class,
                HibernateJpaAutoConfiguration.class,
                JpaRepositoriesAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {
        SystemSettingController.class,
        GlobalExceptionHandler.class,
        SystemSettingControllerTest.TestConfig.class,
        SystemSettingControllerTest.TestWebMvcConfig.class
})
@Import(GlobalExceptionHandler.class)
class SystemSettingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SystemSettingService systemSettingService;

    @MockBean
    private AuthorizationInterceptorProperties authorizationInterceptorProperties;

    @MockBean
    private AuthChecker authChecker;

    @MockBean
    private RolePermissionChecker rolePermissionChecker;

    @MockBean
    private ErrorCodeService errorCodeService;

    @MockBean
    private TeamsNotificationService teamsNotificationService;

    @BeforeEach
    void setUp() {
        when(authorizationInterceptorProperties.getExcludePaths()).thenReturn(List.of());

        UserModel user = new UserModel();
        user.setUserId("u1");
        user.setRoleId(2);
        CustomUserDetails details = new CustomUserDetails(user, Map.of());
        when(authChecker.requireAuthenticatedUser(any())).thenReturn(details);
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(details, null));
    }

    // SC06-UT-001
    @Test
    void shouldReturn200WhenAuthorized() throws Exception {
        SystemSetting setting = new SystemSetting();
        SystemSettingData data = new SystemSettingData(List.of(
                new SystemSettingItem("label", "PASSWORD_VALID_DAYS", "90")
        ));

        when(systemSettingService.getCurrent()).thenReturn(Optional.of(setting));
        when(systemSettingService.toResponseData(setting)).thenReturn(data);

        mockMvc.perform(get("/api/system"))
                .andExpect(status().isOk());

        verify(systemSettingService).getCurrent();
    }

    // SC06-UT-002
    @Test
    void shouldReturn401WhenNoToken() throws Exception {
        when(authChecker.requireAuthenticatedUser(any()))
                .thenThrow(new BadCredentialsException("Unauthorized"));

        mockMvc.perform(get("/api/system"))
                .andExpect(status().isUnauthorized());

        verify(systemSettingService, never()).getCurrent();
    }

    // SC06-UT-003
    @Test
    void shouldReturn403WhenNoViewPermission() throws Exception {
        org.mockito.Mockito.doThrow(new org.springframework.security.access.AccessDeniedException("Access Denied"))
                .when(rolePermissionChecker).requireAllowed(anyInt(), anyInt(), anyInt());

        mockMvc.perform(get("/api/system"))
                .andExpect(status().isForbidden());

        verify(systemSettingService, never()).getCurrent();
    }

    // SC06-UT-004
    @Test
    void shouldReturn200WhenValidUpdate() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        SystemSetting updated = new SystemSetting();
        SystemSettingData data = new SystemSettingData(List.of(
                new SystemSettingItem("label", "PASSWORD_VALID_DAYS", "90")
        ));

        when(systemSettingService.upsert(any())).thenReturn(updated);
        when(systemSettingService.toResponseData(updated)).thenReturn(data);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(systemSettingService).upsert(any());
    }

    // SC06-UT-005
    @Test
    void shouldReturn401WhenNoTokenOnUpdate() throws Exception {
        when(authChecker.requireAuthenticatedUser(any()))
                .thenThrow(new BadCredentialsException("Unauthorized"));

        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-006
    @Test
    void shouldReturn403WhenNoUpdatePermission() throws Exception {
        org.mockito.Mockito.doThrow(new org.springframework.security.access.AccessDeniedException("Access Denied"))
                .when(rolePermissionChecker).requireAllowed(anyInt(), anyInt(), anyInt());

        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-007
    @Test
    void shouldReturn400WhenSettingsMissing() throws Exception {
        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-008
    @Test
    void shouldReturn400WhenSettingIdMissing() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(null);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-009
    @Test
    void shouldReturn400WhenSettingValueMissing() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(null);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-010
    @Test
    void shouldReturn400WhenValueLessThan1() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(0);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-011
    @Test
    void shouldAcceptPasswordExpiryAtMaxBoundary() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(360);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        SystemSetting updated = new SystemSetting();
        SystemSettingData data = new SystemSettingData(List.of(
                new SystemSettingItem("label", "PASSWORD_VALID_DAYS", "360")
        ));

        when(systemSettingService.upsert(any())).thenReturn(updated);
        when(systemSettingService.toResponseData(updated)).thenReturn(data);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(systemSettingService).upsert(any());
    }

    // SC06-UT-012
    @Test
    void shouldReturn400WhenPasswordExpiryOverMaxDigits() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(361);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-013
    @Test
    void shouldAcceptNoticeDisplayLimitAtMaxBoundary() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(100);

        SystemSetting updated = new SystemSetting();
        SystemSettingData data = new SystemSettingData(List.of(
                new SystemSettingItem("label", "NUMBER_OF_NOTICES", "100")
        ));

        when(systemSettingService.upsert(any())).thenReturn(updated);
        when(systemSettingService.toResponseData(updated)).thenReturn(data);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(systemSettingService).upsert(any());
    }

    // SC06-UT-014
    @Test
    void shouldReturn400WhenNoticeDisplayLimitOverMaxDigits() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(101);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-017
    @Test
    void shouldReturnBadRequestWhenRequestBodyMissing() throws Exception {
        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-018
    @Test
    void shouldReturnBadRequestWhenZeroValueProvided() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(0);
        req.setNumberOfNotices(10);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-019
    @Test
    void shouldAcceptMaxBoundaryValue() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(360);
        req.setPasswordReissueUrlExpiration(7);
        req.setNumberOfRetries(20);
        req.setNumberOfNotices(100);

        SystemSetting updated = new SystemSetting();
        SystemSettingData data = new SystemSettingData(List.of(
                new SystemSettingItem("label", "PASSWORD_VALID_DAYS", "360")
        ));

        when(systemSettingService.upsert(any())).thenReturn(updated);
        when(systemSettingService.toResponseData(updated)).thenReturn(data);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(systemSettingService).upsert(any());
    }

    // SC06-UT-020
    @Test
    void shouldReturnBadRequestWhenValueExceedsMax() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(360);
        req.setPasswordReissueUrlExpiration(7);
        req.setNumberOfRetries(21);
        req.setNumberOfNotices(100);

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(systemSettingService, never()).upsert(any());
    }

    // SC06-UT-021
    @Test
    void shouldReturnInternalServerErrorWhenServiceThrows() throws Exception {
        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        when(systemSettingService.upsert(any()))
                .thenThrow(new RuntimeException("boom"));

        mockMvc.perform(put("/api/system")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isInternalServerError());

        verify(systemSettingService).upsert(any());
    }

    @TestConfiguration
    static class TestConfig {
        @Bean
        RequirePermissionInterceptor requirePermissionInterceptor(
                AuthorizationInterceptorProperties props,
                AuthChecker authChecker,
                RolePermissionChecker rolePermissionChecker) {
            return new RequirePermissionInterceptor(props, authChecker, rolePermissionChecker);
        }
    }

    @TestConfiguration
    static class TestWebMvcConfig implements WebMvcConfigurer {
        private final RequirePermissionInterceptor interceptor;

        TestWebMvcConfig(RequirePermissionInterceptor interceptor) {
            this.interceptor = interceptor;
        }

        @Override
        public void addInterceptors(InterceptorRegistry registry) {
            registry.addInterceptor(interceptor);
        }
    }
}
