package com.example.appserver.controller;

import com.example.appserver.request.user.CreateUserRequest;
import com.example.appserver.request.user.DeleteUserRequest;
import com.example.appserver.request.user.UnlockUserRequest;
import com.example.appserver.request.user.UpdateUserRequest;
import com.example.appserver.request.user.UserListQuery;
import com.example.appserver.response.user.UserCreateResponse;
import com.example.appserver.response.user.UserDetailResponse;
import com.example.appserver.response.user.UserListData;
import com.example.appserver.response.user.UserListResponse;
import com.example.appserver.security.RequirePermission;
import com.example.appserver.security.CustomUserDetails;
import com.example.appserver.service.UserService;
import com.example.servercommon.exception.CustomException;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.responseModel.UserResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldReturn200WhenListingUsers() {
        UserListQuery query = new UserListQuery();
        query.setPageNumber(1);
        query.setPagesize(10);

        UserListResponse u1 = new UserListResponse(
                "user-1",
                "u1@example.com",
                "Yamada",
                "Taro",
                1,
                "ROLE_NAME_PLACEHOLDER",
                false,
                0,
                null,
                LocalDateTime.of(2026, 2, 13, 10, 0, 0)
        );
        UserListResponse u2 = new UserListResponse(
                "user-2",
                "u2@example.com",
                "Suzuki",
                "Hanako",
                2,
                "ROLE_NAME_PLACEHOLDER",
                true,
                2,
                LocalDateTime.of(2026, 2, 12, 9, 0, 0),
                LocalDateTime.of(2026, 2, 13, 9, 0, 0)
        );
        UserListData data = new UserListData(List.of(u1, u2), 2L);

        when(userService.getUserList(query)).thenReturn(data);

        BindingResult br = new BeanPropertyBindingResult(query, "query");
        ResponseEntity<ApiResponse<UserListData>> response = userController.getUserList(query, br);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getData());
        assertEquals(2L, response.getBody().getData().getTotal());
        assertEquals(2, response.getBody().getData().getUsers().size());

        verify(userService, times(1)).getUserList(query);
    }

    @Test
    void shouldCallServiceWhenCreatingUser() {
        setAuthenticatedUser("admin-user");

        CreateUserRequest request = new CreateUserRequest();
        request.setUserId("new-user");
        request.setEmail("new-user@example.com");
        request.setSurname("Sato");
        request.setGivenName("Ichiro");
        request.setPhoneNo("09011112222");
        request.setRoleId(2);

        when(userService.existsByUserId("new-user")).thenReturn(false);
        when(userService.existsByEmail("new-user@example.com")).thenReturn(false);
        when(userService.roleExists(2)).thenReturn(true);
        when(passwordEncoder.encode("PLACEHOLDER")).thenReturn("encoded-password");

        UserModel created = new UserModel();
        created.setUserId("new-user");
        when(userService.createUser(any(UserModel.class))).thenReturn(created);

        ResponseEntity<ApiResponse<UserCreateResponse>> response = userController.createUser(request);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getData());
        assertEquals("new-user", response.getBody().getData().getUserId());

        ArgumentCaptor<UserModel> userCaptor = ArgumentCaptor.forClass(UserModel.class);
        verify(userService, times(1)).createUser(userCaptor.capture());
        verify(userService, times(1)).existsByUserId("new-user");
        verify(userService, times(1)).existsByEmail("new-user@example.com");
        verify(userService, times(1)).roleExists(2);

        UserModel toCreate = userCaptor.getValue();
        assertEquals("new-user", toCreate.getUserId());
        assertEquals("new-user@example.com", toCreate.getEmail());
        assertEquals("admin-user", toCreate.getCreatorUserId());
        assertEquals("admin-user", toCreate.getEditorUserId());
        assertEquals("encoded-password", toCreate.getPassword());
    }

    @Test
    void shouldRejectWhenEmailAlreadyExists() {
        setAuthenticatedUser("admin-user");

        CreateUserRequest request = new CreateUserRequest();
        request.setUserId("new-user");
        request.setEmail("dup@example.com");
        request.setSurname("Sato");
        request.setGivenName("Ichiro");
        request.setPhoneNo("09011112222");
        request.setRoleId(2);

        when(userService.existsByUserId("new-user")).thenReturn(false);
        when(userService.existsByEmail("dup@example.com")).thenReturn(true);

        CustomException ex = assertThrows(CustomException.class, () -> userController.createUser(request));

        assertEquals("E409", ex.getCode());
        assertEquals("email already exists", ex.getMessage());

        verify(userService, times(1)).existsByUserId("new-user");
        verify(userService, times(1)).existsByEmail("dup@example.com");
        verify(userService, never()).roleExists(any());
        verify(userService, never()).createUser(any(UserModel.class));
    }

    @Test
    void shouldRejectWhenRoleIdNotFound() {
        setAuthenticatedUser("admin-user");

        CreateUserRequest request = new CreateUserRequest();
        request.setUserId("new-user");
        request.setEmail("new-user@example.com");
        request.setSurname("Sato");
        request.setGivenName("Ichiro");
        request.setPhoneNo("09011112222");
        request.setRoleId(999);

        when(userService.existsByUserId("new-user")).thenReturn(false);
        when(userService.existsByEmail("new-user@example.com")).thenReturn(false);
        when(userService.roleExists(999)).thenReturn(false);

        CustomException ex = assertThrows(CustomException.class, () -> userController.createUser(request));

        assertEquals("E4001", ex.getCode());
        assertEquals("Invalid role id", ex.getMessage());

        verify(userService, times(1)).existsByUserId("new-user");
        verify(userService, times(1)).existsByEmail("new-user@example.com");
        verify(userService, times(1)).roleExists(999);
        verify(userService, never()).createUser(any(UserModel.class));
    }

    @Test
    void shouldReturn404WhenUserNotFound() {
        when(userService.getUserDetail("not-found-user")).thenReturn(Optional.empty());

        ResponseEntity<ApiResponse<UserDetailResponse>> response = userController.getUserDetail("not-found-user");

        assertEquals(404, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("E4041", response.getBody().getErrorCode());
        assertEquals("user_id not found", response.getBody().getMessage());

        verify(userService, times(1)).getUserDetail("not-found-user");
    }

    @Test
    void shouldReturn200WhenUpdatingUser() {
        setAuthenticatedUser("admin-user");

        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("updated@example.com");
        request.setSurname("UpdatedSurname");
        request.setGivenName("UpdatedGiven");
        request.setPhoneNo("08099990000");
        request.setRoleId(3);

        UserModel existing = new UserModel();
        existing.setUserId("target-user");
        existing.setEmail("old@example.com");
        existing.setSurname("OldSurname");
        existing.setGivenName("OldGiven");
        existing.setMobileNo("09000000000");
        existing.setRoleId(1);

        UserModel updated = new UserModel();
        updated.setUserId("target-user");
        updated.setEmail("updated@example.com");
        updated.setSurname("UpdatedSurname");
        updated.setGivenName("UpdatedGiven");
        updated.setMobileNo("08099990000");
        updated.setRoleId(3);

        when(userService.getUserByUserId("target-user")).thenReturn(Optional.of(existing));
        when(userService.roleExists(3)).thenReturn(true);
        when(userService.updateUser(any(UserModel.class))).thenReturn(updated);

        ResponseEntity<ApiResponse<UserResponse>> response = userController.updateUserById("target-user", request);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getData());
        assertEquals("target-user", response.getBody().getData().getUserId());
        assertEquals("updated@example.com", response.getBody().getData().getEmail());

        ArgumentCaptor<UserModel> updateCaptor = ArgumentCaptor.forClass(UserModel.class);
        verify(userService, times(1)).getUserByUserId("target-user");
        verify(userService, times(1)).roleExists(3);
        verify(userService, times(1)).updateUser(updateCaptor.capture());

        UserModel toUpdate = updateCaptor.getValue();
        assertEquals("updated@example.com", toUpdate.getEmail());
        assertEquals("UpdatedSurname", toUpdate.getSurname());
        assertEquals("UpdatedGiven", toUpdate.getGivenName());
        assertEquals("08099990000", toUpdate.getMobileNo());
        assertEquals(3, toUpdate.getRoleId());
        assertEquals("admin-user", toUpdate.getEditorUserId());
    }

    @Test
    void shouldRejectWhenUpdatingEmailToExistingOne() {
        setAuthenticatedUser("admin-user");

        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("dup@example.com");

        UserModel existing = new UserModel();
        existing.setUserId("target-user");
        existing.setEmail("old@example.com");
        existing.setRoleId(1);

        when(userService.getUserByUserId("target-user")).thenReturn(Optional.of(existing));
        when(userService.existsByEmail("dup@example.com")).thenReturn(true);

        CustomException ex = assertThrows(
                CustomException.class,
                () -> userController.updateUserById("target-user", request)
        );

        assertEquals("E409", ex.getCode());
        assertEquals("email already exists", ex.getMessage());
    }

    @Test
    void shouldReturn200WhenDeletingUser() {
        setAuthenticatedUser("admin-user");

        DeleteUserRequest request = new DeleteUserRequest();
        request.setDeletionReason("retired account");

        UserModel existing = new UserModel();
        existing.setUserId("delete-target");
        existing.setIsDeleted(false);

        when(userService.getUserByUserId("delete-target")).thenReturn(Optional.of(existing));
        when(userService.updateUser(any(UserModel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<ApiResponse<String>> response = userController.deleteUser("delete-target", request);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("user is deleted", response.getBody().getData());

        ArgumentCaptor<UserModel> deleteCaptor = ArgumentCaptor.forClass(UserModel.class);
        verify(userService, times(1)).getUserByUserId("delete-target");
        verify(userService, times(1)).updateUser(deleteCaptor.capture());

        UserModel deletedUser = deleteCaptor.getValue();
        assertTrue(Boolean.TRUE.equals(deletedUser.getIsDeleted()));
        assertEquals("retired account", deletedUser.getDeletionReason());
        assertEquals("admin-user", deletedUser.getEditorUserId());
    }

    @Test
    void shouldReturn200WhenRestoringUser() {
        setAuthenticatedUser("admin-user");

        UserModel existing = new UserModel();
        existing.setUserId("restore-target");
        existing.setIsDeleted(true);

        when(userService.getUserByUserId("restore-target")).thenReturn(Optional.of(existing));
        when(userService.updateUser(any(UserModel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<ApiResponse<String>> response = userController.restoreUser("restore-target");

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("user is restored", response.getBody().getData());

        ArgumentCaptor<UserModel> restoreCaptor = ArgumentCaptor.forClass(UserModel.class);
        verify(userService, times(1)).getUserByUserId("restore-target");
        verify(userService, times(1)).updateUser(restoreCaptor.capture());

        UserModel restoredUser = restoreCaptor.getValue();
        assertFalse(Boolean.TRUE.equals(restoredUser.getIsDeleted()));
        assertEquals("admin-user", restoredUser.getEditorUserId());
    }

    @Test
    void shouldReturn200WhenUnlockingUser() {
        setAuthenticatedUser("admin-user");

        UnlockUserRequest request = new UnlockUserRequest();
        request.setLockedUserId("locked-user");

        UserModel locked = new UserModel();
        locked.setUserId("locked-user");
        locked.setIsLockedOut(true);
        locked.setPasswordSetTime(LocalDateTime.of(2026, 2, 13, 10, 0, 0));

        when(userService.getUserByUserId("locked-user")).thenReturn(Optional.of(locked));
        when(userService.updateUser(any(UserModel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<ApiResponse<String>> response = userController.unlockUser(request);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("user is unlocked", response.getBody().getData());

        ArgumentCaptor<UserModel> unlockCaptor = ArgumentCaptor.forClass(UserModel.class);
        verify(userService, times(1)).getUserByUserId("locked-user");
        verify(userService, times(1)).updateUser(unlockCaptor.capture());

        UserModel unlockedUser = unlockCaptor.getValue();
        assertFalse(Boolean.TRUE.equals(unlockedUser.getIsLockedOut()));
        assertEquals("admin-user", unlockedUser.getEditorUserId());
    }

    // =========================================================
    // SC02-UT-033
    // createUser: invalid timezone -> 400 equivalent validation error
    // =========================================================
    @Test
    void shouldReturn400WhenTimezoneInvalidOnCreate() {
        setAuthenticatedUser("admin-user");

        CreateUserRequest request = new CreateUserRequest();
        request.setUserId("new-user");
        request.setEmail("new-user@example.com");
        request.setSurname("Sato");
        request.setGivenName("Ichiro");
        request.setPhoneNo("09011112222");
        request.setRoleId(2);

        assertTrue(setTimezoneIfPresent(request, "timezone::Tokyo"),
                "CreateUserRequest must have timezone field for SC02-UT-033");

        CustomException ex = assertThrows(CustomException.class, () -> userController.createUser(request));
        assertEquals("E4001", ex.getCode());

        verify(userService, never()).createUser(any(UserModel.class));
    }

    // =========================================================
    // SC02-UT-034
    // updateUser: invalid timezone -> 400 equivalent validation error
    // =========================================================
    @Test
    void shouldReturn400WhenTimezoneInvalidOnUpdate() {
        setAuthenticatedUser("admin-user");

        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("updated@example.com");

        assertTrue(setTimezoneIfPresent(request, "timezone::Tokyo"),
                "UpdateUserRequest must have timezone field for SC02-UT-034");

        CustomException ex = assertThrows(CustomException.class,
                () -> userController.updateUserById("target-user", request));
        assertEquals("E4001", ex.getCode());

        verify(userService, never()).updateUser(any(UserModel.class));
    }

    // =========================================================
    // SC02-UT-035
    // createUser without token -> unauthorized equivalent
    // =========================================================
    @Test
    void shouldReturn401WhenNoTokenOnCreateUser() {
        SecurityContextHolder.clearContext();

        CreateUserRequest request = new CreateUserRequest();
        request.setUserId("new-user");
        request.setEmail("new-user@example.com");
        request.setSurname("Sato");
        request.setGivenName("Ichiro");
        request.setPhoneNo("09011112222");
        request.setRoleId(2);

        CustomException ex = assertThrows(CustomException.class, () -> userController.createUser(request));
        assertEquals("INVALID_USER", ex.getCode());
        verify(userService, never()).createUser(any(UserModel.class));
    }

    // =========================================================
    // SC02-UT-036
    // createUser requires permission configuration (403 at security layer)
    // =========================================================
    @Test
    void shouldRequirePermissionOnCreateUser() throws Exception {
        Method m = UserController.class.getMethod("createUser", CreateUserRequest.class);
        RequirePermission rp = m.getAnnotation(RequirePermission.class);

        assertNotNull(rp);
        assertEquals(1, rp.permissionId());
        assertEquals(3, rp.statusLevelId());
    }

    // =========================================================
    // SC02-UT-037
    // deleteUser: nonexistent user -> 404 equivalent not found error
    // =========================================================
    @Test
    void shouldReturn404WhenDeletingNonexistentUser() {
        setAuthenticatedUser("admin-user");

        DeleteUserRequest request = new DeleteUserRequest();
        request.setDeletionReason("reason");

        when(userService.getUserByUserId("missing-user")).thenReturn(Optional.empty());

        CustomException ex = assertThrows(CustomException.class,
                () -> userController.deleteUser("missing-user", request));

        assertEquals("E4041", ex.getCode());
        assertEquals("user_id not found", ex.getMessage());
        verify(userService, never()).updateUser(any(UserModel.class));
    }

    private boolean setTimezoneIfPresent(Object request, String value) {
        try {
            Method setter = request.getClass().getMethod("setTimezone", String.class);
            setter.invoke(request, value);
            return true;
        } catch (NoSuchMethodException e) {
            return false;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setAuthenticatedUser(String userId) {
        UserModel currentUser = new UserModel();
        currentUser.setUserId(userId);
        currentUser.setRoleId(1);

        CustomUserDetails details = new CustomUserDetails(currentUser, Map.of());
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }


    
}
