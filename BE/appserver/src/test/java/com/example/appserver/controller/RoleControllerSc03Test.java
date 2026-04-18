package com.example.appserver.controller;

import com.example.appserver.config.AuthorizationInterceptorProperties;
import com.example.appserver.interceptor.RequirePermissionInterceptor;
import com.example.appserver.request.role.RoleCreateRequest;
import com.example.appserver.request.role.RoleDeleteRequest;
import com.example.appserver.request.role.RoleListQuery;
import com.example.appserver.request.role.RoleUpdateRequest;
import com.example.appserver.response.role.RoleCreateResponse;
import com.example.appserver.response.role.RoleDeleteResponse;
import com.example.appserver.response.role.RoleDetailResponse;
import com.example.appserver.response.role.RoleListData;
import com.example.appserver.security.AuthChecker;
import com.example.appserver.security.CustomUserDetails;
import com.example.appserver.security.RolePermissionChecker;
import com.example.appserver.service.RolePermissionService;
import com.example.servercommon.exception.CustomException;
import com.example.servercommon.exception.GlobalExceptionHandler;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.service.ErrorCodeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RoleControllerSc03Test {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private RolePermissionService roleService;
    private AuthChecker authChecker;
    private RolePermissionChecker rolePermissionChecker;

    @BeforeEach
    void setUp() {
        roleService = Mockito.mock(RolePermissionService.class);
        authChecker = Mockito.mock(AuthChecker.class);
        rolePermissionChecker = Mockito.mock(RolePermissionChecker.class);
        ErrorCodeService errorCodeService = Mockito.mock(ErrorCodeService.class);
        TeamsNotificationService teamsNotificationService = Mockito.mock(TeamsNotificationService.class);
        Mockito.when(errorCodeService.getErrorMessage(any(), any())).thenReturn("error");

        AuthorizationInterceptorProperties props = new AuthorizationInterceptorProperties();
        RequirePermissionInterceptor interceptor = new RequirePermissionInterceptor(
                props, authChecker, rolePermissionChecker
        );

        RolePermissionController controller = new RolePermissionController(roleService);
        GlobalExceptionHandler geh = new GlobalExceptionHandler(errorCodeService, teamsNotificationService);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .addInterceptors(interceptor)
                .setControllerAdvice(geh)
                .build();

        objectMapper = new ObjectMapper();
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken("u", "p"));
    }

    @Test
    void SC03_UT_001_shouldReturn200WhenListingRoles() throws Exception {
        allowAuthAndPermission(10);
        Mockito.when(roleService.getRoleList(any(RoleListQuery.class))).thenReturn(new RoleListData(List.of(), 0L));

        mockMvc.perform(get("/api/roles/list")
                        .param("pageNumber", "1")
                        .param("pagesize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void SC03_UT_002_shouldCallServiceWhenCreatingRole() throws Exception {
        allowAuthAndPermission(10);
        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("Operator");
        Mockito.when(roleService.createRole(any(RoleCreateRequest.class))).thenReturn(new RoleCreateResponse(5));

        mockMvc.perform(post("/api/roles/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roleId", is(5)));
    }

    @Test
    void SC03_UT_003_shouldReturn404WhenRoleNotFound() throws Exception {
        allowAuthAndPermission(10);
        Mockito.when(roleService.getRoleDetail(99)).thenThrow(new CustomException("E4041", "role not found"));

        mockMvc.perform(get("/api/roles/99"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4041")));
    }

    @Test
    void SC03_UT_004_shouldReturn400WhenValidationErrorOccurs() throws Exception {
        allowAuthAndPermission(10);
        Mockito.when(roleService.updateRole(Mockito.eq(7), any(RoleUpdateRequest.class)))
                .thenThrow(new CustomException("E4001", "invalid"));

        mockMvc.perform(put("/api/roles/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4001")));
    }

    @Test
    void SC03_UT_005_shouldReturn200WhenDeletingRole() throws Exception {
        allowAuthAndPermission(10);
        RoleDeleteRequest req = new RoleDeleteRequest();
        req.setDeletionReason("retired");
        Mockito.when(roleService.deleteRole(Mockito.eq(6), any(RoleDeleteRequest.class)))
                .thenReturn(new RoleDeleteResponse(6));

        mockMvc.perform(put("/api/roles/6/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roleId", is(6)));
    }

    @Test
    void SC03_UT_006_shouldReturn401WhenNoTokenOnList() throws Exception {
        denyByMissingToken();

        mockMvc.perform(get("/api/roles/list"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void SC03_UT_007_shouldReturn403WhenNoViewPermission() throws Exception {
        allowAuthAndPermission(10);
        doThrow(new org.springframework.security.access.AccessDeniedException("denied"))
                .when(rolePermissionChecker).requireAllowed(any(), anyInt(), anyInt());

        mockMvc.perform(get("/api/roles/list"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code", is("E4031")));
    }

    @Test
    void SC03_UT_008_shouldReturn401WhenNoTokenOnCreate() throws Exception {
        denyByMissingToken();
        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("x");

        mockMvc.perform(post("/api/roles/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void SC03_UT_009_shouldReturn403WhenNoCreatePermissionOnCreate() throws Exception {
        allowAuthAndPermission(10);
        doThrow(new org.springframework.security.access.AccessDeniedException("denied"))
                .when(rolePermissionChecker).requireAllowed(any(), anyInt(), anyInt());
        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("x");

        mockMvc.perform(post("/api/roles/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    void SC03_UT_010_shouldReturn404WhenUpdatingNonexistentRole() throws Exception {
        allowAuthAndPermission(10);
        Mockito.when(roleService.updateRole(Mockito.eq(777), any(RoleUpdateRequest.class)))
                .thenThrow(new CustomException("E4041", "not found"));

        mockMvc.perform(put("/api/roles/777")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4041")));
    }

    @Test
    void SC03_UT_011_shouldReturn401WhenNoTokenOnUpdate() throws Exception {
        denyByMissingToken();

        mockMvc.perform(put("/api/roles/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void SC03_UT_012_shouldReturn403WhenNoUpdatePermissionOnUpdate() throws Exception {
        allowAuthAndPermission(10);
        doThrow(new org.springframework.security.access.AccessDeniedException("denied"))
                .when(rolePermissionChecker).requireAllowed(any(), anyInt(), anyInt());

        mockMvc.perform(put("/api/roles/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void SC03_UT_013_shouldReturn404WhenDeletingNonexistentRole() throws Exception {
        allowAuthAndPermission(10);
        Mockito.when(roleService.deleteRole(Mockito.eq(888), any(RoleDeleteRequest.class)))
                .thenThrow(new CustomException("E4041", "not found"));
        RoleDeleteRequest req = new RoleDeleteRequest();
        req.setDeletionReason("x");

        mockMvc.perform(put("/api/roles/888/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4041")));
    }

    @Test
    void SC03_UT_014_shouldReturn401WhenNoTokenOnDelete() throws Exception {
        denyByMissingToken();
        RoleDeleteRequest req = new RoleDeleteRequest();
        req.setDeletionReason("x");

        mockMvc.perform(put("/api/roles/1/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void SC03_UT_015_shouldReturn403WhenNoDeletePermissionOnDelete() throws Exception {
        allowAuthAndPermission(10);
        doThrow(new org.springframework.security.access.AccessDeniedException("denied"))
                .when(rolePermissionChecker).requireAllowed(any(), anyInt(), anyInt());
        RoleDeleteRequest req = new RoleDeleteRequest();
        req.setDeletionReason("x");

        mockMvc.perform(put("/api/roles/1/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    private void allowAuthAndPermission(int roleId) {
        UserModel u = new UserModel();
        u.setUserId("u1");
        u.setRoleId(roleId);
        CustomUserDetails details = new CustomUserDetails(u, Map.of());
        Mockito.when(authChecker.requireAuthenticatedUser(any())).thenReturn(details);
    }

    private void denyByMissingToken() {
        Mockito.when(authChecker.requireAuthenticatedUser(any()))
                .thenThrow(new BadCredentialsException("Unauthorized"));
    }
}
