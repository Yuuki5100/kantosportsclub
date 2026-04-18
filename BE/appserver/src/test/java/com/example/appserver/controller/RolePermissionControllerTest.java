package com.example.appserver.controller;

import com.example.appserver.request.role.RoleCreateRequest;
import com.example.appserver.request.role.RoleDeleteRequest;
import com.example.appserver.request.role.RoleListQuery;
import com.example.appserver.response.role.RoleCreateResponse;
import com.example.appserver.response.role.RoleDeleteResponse;
import com.example.appserver.response.role.RoleDropdownData;
import com.example.appserver.response.role.RoleListData;
import com.example.appserver.service.RolePermissionService;
import com.example.servercommon.exception.CustomException;
import com.example.servercommon.exception.GlobalExceptionHandler;
import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.service.ErrorCodeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RolePermissionControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private RolePermissionService roleService;

    @BeforeEach
    void setUp() {
        roleService = Mockito.mock(RolePermissionService.class);
        ErrorCodeService errorCodeService = Mockito.mock(ErrorCodeService.class);
        TeamsNotificationService teamsNotificationService = Mockito.mock(TeamsNotificationService.class);
        Mockito.when(errorCodeService.getErrorMessage(anyString(), anyString())).thenReturn("error");

        RolePermissionController controller = new RolePermissionController(roleService);
        GlobalExceptionHandler geh = new GlobalExceptionHandler(errorCodeService, teamsNotificationService);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(geh)
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void SC01_UT_CTRL_001_shouldReturnOkWhenGetRoleListValidQuery() throws Exception {
        Mockito.when(roleService.getRoleList(any(RoleListQuery.class)))
                .thenReturn(new RoleListData(List.of(), 0L));

        mockMvc.perform(get("/api/roles/list")
                        .param("pageNumber", "1")
                        .param("pagesize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void SC01_UT_CTRL_002_shouldReturnBadRequestWhenGetRoleListInvalidPageSize() throws Exception {
        mockMvc.perform(get("/api/roles/list")
                        .param("pageNumber", "1")
                        .param("pagesize", "51"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4001")));
    }

    @Test
    void SC01_UT_CTRL_003_shouldReturnOkWhenGetRoleDropdown() throws Exception {
        Mockito.when(roleService.getRoleDropdown())
                .thenReturn(new RoleDropdownData(List.of()));

        mockMvc.perform(get("/api/roles/dropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void SC01_UT_CTRL_004_shouldReturnBadRequestWhenCreateRoleNameAlreadyExists() throws Exception {
        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("Admin");

        Mockito.when(roleService.createRole(any(RoleCreateRequest.class)))
                .thenThrow(new CustomException("E409", "role_name already exists"));

        mockMvc.perform(post("/api/roles/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E409")));
    }

    @Test
    void SC01_UT_CTRL_005_shouldReturnOkWhenCreateRoleValid() throws Exception {
        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("Operator");
        req.setDescription("Operator role");

        Mockito.when(roleService.createRole(any(RoleCreateRequest.class)))
                .thenReturn(new RoleCreateResponse(11));

        mockMvc.perform(post("/api/roles/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.roleId", is(11)));
    }

    @Test
    void SC01_UT_CTRL_006_shouldReturnOkWhenDeleteRoleValid() throws Exception {
        RoleDeleteRequest req = new RoleDeleteRequest();
        req.setDeletionReason("No longer used");

        Mockito.when(roleService.deleteRole(Mockito.eq(7), any(RoleDeleteRequest.class)))
                .thenReturn(new RoleDeleteResponse(7));

        mockMvc.perform(put("/api/roles/7/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.roleId", is(7)));
    }
}
