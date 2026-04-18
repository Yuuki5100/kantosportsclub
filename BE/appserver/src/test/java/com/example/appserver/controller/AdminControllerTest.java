package com.example.appserver.controller;

import com.example.appserver.request.admin.UpdatePermissionsRequest;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRolePermission;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.repository.UserRolePermissionRepository;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.ErrorCodeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserRolePermissionRepository permissionRepository;

    @Mock
    private ErrorCodeService errorCodeService;

    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void updateUserPermissions_userNotFound_returns404() {
        UpdatePermissionsRequest request = new UpdatePermissionsRequest();
        request.setUserId("u-001");
        request.setPermissions(Map.of("0", 1));

        when(userRepository.findById("u-001")).thenReturn(Optional.empty());
        when(errorCodeService.getErrorMessage("E4041", "en")).thenReturn("User not found");

        ResponseEntity<ApiResponse<String>> response =
                adminController.updateUserPermissions(request, Locale.ENGLISH);

        assertEquals(404, response.getStatusCodeValue());
        assertEquals("E4041", response.getBody().getErrorCode());
        verify(userRepository).findById("u-001");
    }

    @Test
    void updateUserPermissions_userExists_updatesPermissions() {
        UserModel user = new UserModel();
        user.setUserId("u-001");

        UpdatePermissionsRequest request = new UpdatePermissionsRequest();
        request.setUserId("u-001");
        request.setPermissions(Map.of("0", 1, "1", 2));

        when(userRepository.findById("u-001")).thenReturn(Optional.of(user));
        when(permissionRepository.findAllByUserId("u-001")).thenReturn(List.of(
                new UserRolePermission("u-001", "/", 1),
                new UserRolePermission("u-001", "/dashboard", 1)
        ));

        ResponseEntity<ApiResponse<String>> response =
                adminController.updateUserPermissions(request, Locale.ENGLISH);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("✅ Permissions updated successfully", response.getBody().getData());

        verify(permissionRepository, times(2)).delete(any(UserRolePermission.class));
        verify(permissionRepository, atLeast(1)).save(any(UserRolePermission.class));
    }

    @Test
    void getUserList_returnsAllUsers() {
        UserModel user1 = new UserModel(); user1.setUserId("u-1");
        UserModel user2 = new UserModel(); user2.setUserId("u-2");

        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        ResponseEntity<ApiResponse<List<UserModel>>> response = adminController.getUserList();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(2, response.getBody().getData().size());
        assertEquals("u-1", response.getBody().getData().get(0).getUserId());
        assertEquals("u-2", response.getBody().getData().get(1).getUserId());
    }
}
