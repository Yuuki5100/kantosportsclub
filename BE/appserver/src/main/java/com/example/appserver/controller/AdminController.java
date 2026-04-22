package com.example.appserver.controller;

import com.example.appserver.request.admin.UpdatePermissionsRequest;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRolePermission;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.repository.UserRolePermissionRepository;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.ErrorCodeService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final UserRolePermissionRepository permissionRepository;
    private final ErrorCodeService errorCodeService;

    public AdminController(UserRepository userRepository,
                           UserRolePermissionRepository permissionRepository,
                           ErrorCodeService errorCodeService) {
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.errorCodeService = errorCodeService;
    }

    // ユーザー権限更新（管理者のみアクセス可能）
    @PutMapping("/user/permissions")
    @PreAuthorize("(@permissionChecker.checkPermission(authentication, 'PUT', '/admin/user/permissions', 3)) "
            + "or (@permissionChecker.checkPermission(authentication, 'GET', '/admin', 2))")
    public ResponseEntity<ApiResponse<String>> updateUserPermissions(
            @Valid @RequestBody UpdatePermissionsRequest request,
            Locale locale) {

        // ★ request.getUserId() は users.user_id (String) 前提
        String targetUserId = request.getUserId();

        UserModel target = userRepository.findById(targetUserId).orElse(null);
        if (target == null) {
            String msg = errorCodeService.getErrorMessage(BackendMessageCatalog.CODE_E4041, locale.getLanguage());
            return ResponseEntity.status(404).body(ApiResponse.error(BackendMessageCatalog.CODE_E4041, msg));
        }

        // 既存の権限を削除
        permissionRepository.findAllByUserId(targetUserId)
                .forEach(permissionRepository::delete);

        // リクエストの permission
        Map<String, Integer> perms = request.getPermissions();

        // resourceのキーを格納したリスト（暫定）
        List<String> resourceList = List.of("/", "/dashboard", "/user/list", "/api/system");

        for (int i = 0; i < resourceList.size(); i++) {
            String resource = resourceList.get(i);
            Integer level = perms != null ? perms.get(String.valueOf(i)) : null;

            if (level != null) {
                UserRolePermission perm = new UserRolePermission(targetUserId, resource, level);
                permissionRepository.save(perm);
            }
        }

        return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_PERMISSIONS_UPDATED));
    }

    // 全ユーザー一覧取得（管理者のみアクセス可能）
    @GetMapping("/user/list")
    @PreAuthorize("(@permissionChecker.checkPermission(authentication, 'GET', '/admin/user/list', 3)) "
            + "or (@permissionChecker.checkPermission(authentication, 'GET', '/admin', 2))")
    public ResponseEntity<ApiResponse<List<UserModel>>> getUserList() {
        List<UserModel> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
