package com.example.appserver.controller;

import com.example.appserver.request.user.ChangePasswordRequest;
import com.example.appserver.request.user.ForgotPasswordRequest;
import com.example.appserver.request.user.ResetPasswordRequest;
import com.example.appserver.request.user.UnlockUserRequest;
import com.example.appserver.security.CustomUserDetails;
import com.example.appserver.service.UserService;
import com.example.servercommon.exception.CustomException;
import com.example.servercommon.exception.GlobalExceptionHandler;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.service.ErrorCodeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserPasswordFlowControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = Mockito.mock(UserService.class);
        BCryptPasswordEncoder passwordEncoder = Mockito.mock(BCryptPasswordEncoder.class);
        ErrorCodeService errorCodeService = Mockito.mock(ErrorCodeService.class);
        TeamsNotificationService teamsNotificationService = Mockito.mock(TeamsNotificationService.class);

        Mockito.lenient().when(errorCodeService.getErrorMessage(anyString(), anyString())).thenReturn("error");

        UserController controller = new UserController(userService, passwordEncoder);
        GlobalExceptionHandler geh = new GlobalExceptionHandler(errorCodeService, teamsNotificationService);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(geh)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void SC01_UT_011_shouldReturnOkWhenUserIdentifierValid() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("user@example.com");
        doNothing().when(userService).forgotPassword("user@example.com");

        mockMvc.perform(post("/api/user/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void SC01_UT_012_shouldReturnBadRequestWhenMissingIdentifier() throws Exception {
        mockMvc.perform(post("/api/user/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4001")));
    }

    @Test
    void SC01_UT_013_shouldNotDiscloseUserExistenceInMessage() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("missing@example.com");
        doThrow(new CustomException("E4041", "user not found")).when(userService).forgotPassword("missing@example.com");

        mockMvc.perform(post("/api/user/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message", containsString("error")));
    }

    @Test
    void SC01_UT_014_shouldReturnOkWhenTokenValidAndPasswordMeetsPolicy() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setPassword("ValidPass123");
        doNothing().when(userService).resetPassword("token-ok", "ValidPass123");

        mockMvc.perform(put("/api/user/reset-password/token-ok")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void SC01_UT_015_shouldReturnBadRequestWhenPasswordMissing() throws Exception {
        mockMvc.perform(put("/api/user/reset-password/token-x")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4001")));
    }

    @Test
    void SC01_UT_016_shouldReturnBadRequestWhenPasswordPolicyViolation() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setPassword("short");

        mockMvc.perform(put("/api/user/reset-password/token-x")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void SC01_UT_017_shouldReturnBadRequestWhenTokenInvalid() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setPassword("ValidPass123");
        doThrow(new CustomException("E401", "invalid token")).when(userService).resetPassword("bad-token", "ValidPass123");

        mockMvc.perform(put("/api/user/reset-password/bad-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void SC01_UT_018_shouldReturnOkWhenCurrentPasswordMatchesAndNewPasswordValid() throws Exception {
        setAuthenticatedUser("u1");
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("old-pass");
        req.setNewPassword("new-pass-123");

        doNothing().when(userService).changePassword("u1", "old-pass", "new-pass-123");

        mockMvc.perform(post("/api/user/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void SC01_UT_019_shouldReturnBadRequestWhenNoToken() throws Exception {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("old-pass");
        req.setNewPassword("new-pass-123");

        mockMvc.perform(post("/api/user/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void SC01_UT_020_shouldReturnBadRequestWhenCurrentPasswordWrong() throws Exception {
        setAuthenticatedUser("u1");
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("wrong");
        req.setNewPassword("new-pass-123");

        doThrow(new CustomException("E4001", "current_password is incorrect"))
                .when(userService).changePassword("u1", "wrong", "new-pass-123");

        mockMvc.perform(post("/api/user/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4001")));
    }
    @Test
    void SC01_UT_030_shouldUnlockAfterAdminOrPolicyIfDefined() throws Exception {
        setAuthenticatedUser("admin");

        UserModel locked = new UserModel();
        locked.setUserId("locked-user");
        locked.setIsLockedOut(true);
        locked.setPasswordSetTime(LocalDateTime.now());

        Mockito.when(userService.getUserByUserId("locked-user")).thenReturn(Optional.of(locked));
        Mockito.when(userService.updateUser(any(UserModel.class))).thenReturn(locked);

        UnlockUserRequest req = new UnlockUserRequest();
        req.setLockedUserId("locked-user");

        mockMvc.perform(put("/api/user/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void SC01_UT_031_shouldReturn404WhenRestoringNonexistentUser() throws Exception {
        setAuthenticatedUser("admin");
        Mockito.when(userService.getUserByUserId("NO_USER")).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/user/NO_USER/restore")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4041")));
    }

    @Test
    void SC01_UT_032_shouldReturn404WhenUnlockingNonexistentUser() throws Exception {
        setAuthenticatedUser("admin");
        Mockito.when(userService.getUserByUserId("NO_USER")).thenReturn(Optional.empty());

        UnlockUserRequest req = new UnlockUserRequest();
        req.setLockedUserId("NO_USER");

        mockMvc.perform(put("/api/user/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4041")));
    }

    @Test
    void SC01_UT_033_shouldReturn400WhenUnlockingSelf() throws Exception {
        setAuthenticatedUser("admin");

        UnlockUserRequest req = new UnlockUserRequest();
        req.setLockedUserId("admin");

        mockMvc.perform(put("/api/user/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4001")));
    }

    @Test
    void SC01_UT_034_shouldReturn400WhenUnlockingUserWithoutPasswordSetTime() throws Exception {
        setAuthenticatedUser("admin");

        UserModel target = new UserModel();
        target.setUserId("u2");
        target.setIsLockedOut(true);
        target.setPasswordSetTime(null);
        Mockito.when(userService.getUserByUserId("u2")).thenReturn(Optional.of(target));

        UnlockUserRequest req = new UnlockUserRequest();
        req.setLockedUserId("u2");

        mockMvc.perform(put("/api/user/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4001")));
    }

    @Test
    void SC01_UT_035_shouldReturn400WhenUnlockingUserThatIsNotLocked() throws Exception {
        setAuthenticatedUser("admin");

        UserModel target = new UserModel();
        target.setUserId("u2");
        target.setIsLockedOut(false);
        target.setPasswordSetTime(LocalDateTime.now());
        Mockito.when(userService.getUserByUserId("u2")).thenReturn(Optional.of(target));

        UnlockUserRequest req = new UnlockUserRequest();
        req.setLockedUserId("u2");

        mockMvc.perform(put("/api/user/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4001")));
    }

    @Test
    void SC01_UT_036_shouldReturn400WhenRestoringAlreadyActiveUser() throws Exception {
        setAuthenticatedUser("admin");

        UserModel active = new UserModel();
        active.setUserId("active-user");
        active.setIsDeleted(false);
        Mockito.when(userService.getUserByUserId("active-user")).thenReturn(Optional.of(active));

        mockMvc.perform(put("/api/user/active-user/restore")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("E4001")));
    }

    private void setAuthenticatedUser(String userId) {
        UserModel user = new UserModel();
        user.setUserId(userId);
        user.setRoleId(1);

        CustomUserDetails principal = new CustomUserDetails(user, Map.of());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
