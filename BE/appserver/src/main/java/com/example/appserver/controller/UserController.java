package com.example.appserver.controller;

import com.example.appserver.request.user.ChangePasswordRequest;
import com.example.appserver.request.user.CreateUserRequest;
import com.example.appserver.request.user.DeleteUserRequest;
import com.example.appserver.request.user.ForgotPasswordRequest;
import com.example.appserver.request.user.UnlockUserRequest;
import com.example.appserver.request.user.ResetPasswordRequest;
import com.example.appserver.request.user.UpdateUserRequest;
import com.example.appserver.request.user.UserListQuery;
import com.example.appserver.response.user.UserCreateResponse;
import com.example.appserver.response.user.UserDetailResponse;
import com.example.appserver.response.user.UserListData;
import com.example.appserver.security.CustomUserDetails;
import com.example.appserver.security.RequirePermission;
import com.example.appserver.service.UserService;
import com.example.servercommon.exception.CustomException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.mapper.UserResponseMapper;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.responseModel.UserResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserController(UserService userService, BCryptPasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/profile")
    //@PreAuthorize("@customPermissionEvaluator.checkPermission(authentication, '/user/profile')")
    @RequirePermission(permissionId = 1, statusLevelId = 2) // USER, 参照
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        CustomUserDetails userDetails = getCustomUserDetailsOrNull();
        if (userDetails == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(BackendMessageCatalog.CODE_INVALID_USER, BackendMessageCatalog.MSG_INVALID_USER));
        }

        UserModel user = userDetails.getDomainUser();
        return ResponseEntity.ok(ApiResponse.success(UserResponseMapper.INSTANCE.fromUser(user)));
    }

    @PostMapping("/change-password")
    //@PreAuthorize("@customPermissionEvaluator.checkPermission(authentication, '/user/change-password')")
    @RequirePermission(permissionId = 1, statusLevelId = 3) // USER, 更新
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        CustomUserDetails userDetails = getCustomUserDetailsOrNull();
        if (userDetails == null) {
            throw new CustomException(BackendMessageCatalog.CODE_INVALID_USER, BackendMessageCatalog.MSG_INVALID_USER);
        }

        String userId = userDetails.getDomainUser().getUserId();
        userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());

        return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_PASSWORD_UPDATED));
    }


    @PostMapping("/create")
    //@PreAuthorize("@customPermissionEvaluator.checkPermission(authentication, '/user/create')")
    @RequirePermission(permissionId = 1, statusLevelId = 3) // USER, 更新
    public ResponseEntity<ApiResponse<UserCreateResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        CustomUserDetails userDetails = getCustomUserDetailsOrNull();
        if (userDetails == null) {
            throw new CustomException(BackendMessageCatalog.CODE_INVALID_USER, BackendMessageCatalog.MSG_INVALID_USER);
        }

        if (userService.existsByUserId(request.getUserId())) {
            throw new CustomException(BackendMessageCatalog.CODE_E409, BackendMessageCatalog.MSG_USER_ID_ALREADY_EXISTS);
        }

        if (userService.existsByEmail(request.getEmail())) {
            throw new CustomException(BackendMessageCatalog.CODE_E409, BackendMessageCatalog.MSG_EMAIL_ALREADY_EXISTS);
        }

        if (!userService.roleExists(request.getRoleId())) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.MSG_INVALID_ROLE_ID);
        }

        UserModel user = new UserModel();
        user.setUserId(request.getUserId());
        user.setEmail(request.getEmail());
        user.setSurname(request.getSurname());
        user.setGivenName(request.getGivenName());
        user.setMobileNo(request.getPhoneNo());
        user.setRoleId(request.getRoleId());
        user.setIsLockedOut(true);
        user.setIsDeleted(false);
        user.setFailedLoginAttempts(0);
        user.setDeletionReason(null);

        // placeholder password (not accepted from API)
        user.setPassword(passwordEncoder.encode("PLACEHOLDER"));

        String currentUserId = userDetails.getDomainUser().getUserId();
        user.setCreatorUserId(currentUserId);
        user.setEditorUserId(currentUserId);

        UserModel created = userService.createUser(user);
        return ResponseEntity.ok(ApiResponse.success(new UserCreateResponse(created.getUserId())));
    }

    @PutMapping("/{id}")
    //@PreAuthorize("@customPermissionEvaluator.checkPermission(authentication, '/user/update')")
    @RequirePermission(permissionId = 1, statusLevelId = 3) // USER, 更新
    public ResponseEntity<ApiResponse<UserResponse>> updateUserById(
            @PathVariable("id") String userId,
            @Valid @RequestBody UpdateUserRequest request) {
        CustomUserDetails userDetails = getCustomUserDetailsOrNull();
        if (userDetails == null) {
            throw new CustomException(BackendMessageCatalog.CODE_INVALID_USER, BackendMessageCatalog.MSG_INVALID_USER);
        }

        UserModel user = userService.getUserByUserId(userId)
                .orElseThrow(() -> new CustomException(
                        BackendMessageCatalog.CODE_E4041,
                        BackendMessageCatalog.ARG_USER_ID_NOT_FOUND));

        if (request.getRoleId() != null && !userService.roleExists(request.getRoleId())) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_ROLE_ID);
        }

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getSurname() != null) {
            user.setSurname(request.getSurname());
        }
        if (request.getGivenName() != null) {
            user.setGivenName(request.getGivenName());
        }
        if (request.getPhoneNo() != null) {
            user.setMobileNo(request.getPhoneNo());
        }
        if (request.getRoleId() != null) {
            user.setRoleId(request.getRoleId());
        }

        String currentUserId = userDetails.getDomainUser().getUserId();
        user.setEditorUserId(currentUserId);

        UserModel updated = userService.updateUser(user);
        return ResponseEntity.ok(ApiResponse.success(UserResponseMapper.INSTANCE.fromUser(updated)));
    }


   @PutMapping("/{id}/delete")
   @RequirePermission(permissionId = 1, statusLevelId = 3) // USER, 変更
   public ResponseEntity<ApiResponse<String>> deleteUser(
           @PathVariable("id") String userId,
           @Valid @RequestBody DeleteUserRequest request) {
       CustomUserDetails userDetails = getCustomUserDetailsOrNull();
       if (userDetails == null) {
           throw new CustomException(BackendMessageCatalog.CODE_INVALID_USER, BackendMessageCatalog.MSG_INVALID_USER);
       }

       UserModel user = userService.getUserByUserId(userId)
               .orElseThrow(() -> new CustomException(
                       BackendMessageCatalog.CODE_E4041,
                       BackendMessageCatalog.ARG_USER_ID_NOT_FOUND));

       if (Boolean.TRUE.equals(user.getIsDeleted())) {
           throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.MSG_USER_ALREADY_DELETED);
       }

       user.setIsDeleted(true);
       user.setDeletionReason(request.getDeletionReason());
       String currentUserId = userDetails.getDomainUser().getUserId();
       user.setEditorUserId(currentUserId);

       userService.updateUser(user);
       return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_USER_DELETED));
   }

    @PutMapping("/{id}/restore")
    @RequirePermission(permissionId = 1, statusLevelId = 3)
    public ResponseEntity<ApiResponse<String>> restoreUser(@PathVariable("id") String userId) {
        CustomUserDetails userDetails = getCustomUserDetailsOrNull();
        if (userDetails == null) {
            throw new CustomException(BackendMessageCatalog.CODE_INVALID_USER, BackendMessageCatalog.MSG_INVALID_USER);
        }

        UserModel user = userService.getUserByUserId(userId)
                .orElseThrow(() -> new CustomException(
                        BackendMessageCatalog.CODE_E4041,
                        BackendMessageCatalog.ARG_USER_ID_NOT_FOUND));

        if (Boolean.FALSE.equals(user.getIsDeleted())) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.MSG_USER_ALREADY_ACTIVE);
        }

        user.setIsDeleted(false);
        String currentUserId = userDetails.getDomainUser().getUserId();
        user.setEditorUserId(currentUserId);

        userService.updateUser(user);
        return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_USER_RESTORED));
    }

    @PutMapping("/unlock")
    //@PreAuthorize("@customPermissionEvaluator.checkPermission(authentication, '/user/update')")
    @RequirePermission(permissionId = 1, statusLevelId = 3) // USER, 変更
    public ResponseEntity<ApiResponse<String>> unlockUser(@Valid @RequestBody UnlockUserRequest request) {
        CustomUserDetails userDetails = getCustomUserDetailsOrNull();
        if (userDetails == null) {
            throw new CustomException(BackendMessageCatalog.CODE_INVALID_USER, BackendMessageCatalog.MSG_INVALID_USER);
        }

        String currentUserId = userDetails.getDomainUser().getUserId();
        String lockedUserId = request.getLockedUserId();

        if (currentUserId != null && currentUserId.equals(lockedUserId)) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.MSG_CANNOT_UNLOCK_YOURSELF);
        }

        UserModel lockedUser = userService.getUserByUserId(lockedUserId)
                .orElseThrow(() -> new CustomException(
                        BackendMessageCatalog.CODE_E4041,
                        BackendMessageCatalog.ARG_USER_ID_NOT_FOUND));

        if (lockedUser.getPasswordSetTime() == null ) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.MSG_USER_PASSWORD_NOT_SET);
        }

        if (!Boolean.TRUE.equals(lockedUser.getIsLockedOut())) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.MSG_USER_IS_NOT_LOCKED);
        }

        lockedUser.setIsLockedOut(false);
        lockedUser.setEditorUserId(currentUserId);
        userService.updateUser(lockedUser);

        return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_USER_UNLOCKED));
    }

    @PutMapping("/reset-password/{token}")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @PathVariable("token") String token,
            @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(token, request.getPassword());
        return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_PASSWORD_SET));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_RESET_PASSWORD_EMAIL_SENT));
    }

    @GetMapping("/list")
    //@PreAuthorize("@customPermissionEvaluator.checkPermission(authentication, '/user/list')")
    @RequirePermission(permissionId = 1, statusLevelId = 2) // USER, 参照
    public ResponseEntity<ApiResponse<UserListData>> getUserList(
            @Valid @ModelAttribute UserListQuery query,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String arg = resolveFirstErrorArg(bindingResult);
            return ResponseEntity.badRequest().body(ApiResponse.error(BackendMessageCatalog.CODE_E4001, arg));
        }

        UserListData data = userService.getUserList(query);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    //@PreAuthorize("@customPermissionEvaluator.checkPermission(authentication, '/user/detail')")
    @RequirePermission(permissionId = 1, statusLevelId = 2) // USER, 参照
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserDetail(@PathVariable("id") String userId) {
        Optional<UserDetailResponse> detailOpt = userService.getUserDetail(userId);
        if (detailOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(BackendMessageCatalog.CODE_E4041, BackendMessageCatalog.ARG_USER_ID_NOT_FOUND));
        }
        return ResponseEntity.ok(ApiResponse.success(detailOpt.get()));
    }

    private CustomUserDetails getCustomUserDetailsOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails cud) {
            return cud;
        }
        return null;
    }

    private String resolveFirstErrorArg(BindingResult bindingResult) {
        FieldError error = bindingResult.getFieldError();
        if (error == null) return null;
        return error.getField();
    }
}
