package com.example.appserver.controller;

import com.example.appserver.request.role.RoleCreateRequest;
import com.example.appserver.request.role.RoleDeleteRequest;
import com.example.appserver.request.role.RoleListQuery;
import com.example.appserver.request.role.RoleUpdateRequest;
import com.example.appserver.response.role.RoleCreateResponse;
import com.example.appserver.response.role.RoleDetailResponse;
import com.example.appserver.response.role.RoleDropdownData;
import com.example.appserver.response.role.RoleDeleteResponse;
import com.example.appserver.response.role.RoleListData;
import com.example.appserver.response.role.RoleUpdateResponse;
import com.example.appserver.security.RequirePermission;
import com.example.appserver.service.RolePermissionService;
import com.example.servercommon.exception.CustomException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.ApiResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/roles")
public class RolePermissionController {
    private final RolePermissionService roleService;

    public RolePermissionController(RolePermissionService roleService) {
        this.roleService = roleService;
    }
    
    @GetMapping("/list")
    @RequirePermission(permissionId =2, statusLevelId = 2) // ROLE, 参照
    public ResponseEntity<ApiResponse<RoleListData>> getRoleList(
            @Valid @ModelAttribute RoleListQuery query,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String arg = resolveFirstErrorArg(bindingResult);
            throw new CustomException(BackendMessageCatalog.CODE_E4001, arg);
        }

        RoleListData data = roleService.getRoleList(query);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/dropdown")
    @RequirePermission(permissionId = 2, statusLevelId = 1) // ROLE, none
    public ResponseEntity<ApiResponse<RoleDropdownData>> getRoleDropdown() {
        RoleDropdownData data = roleService.getRoleDropdown();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    @RequirePermission(permissionId =2, statusLevelId = 2) // ROLE, 参照
    public ResponseEntity<ApiResponse<RoleDetailResponse>> getRoleDetail(@PathVariable("id") Integer roleId) {
        RoleDetailResponse detail = roleService.getRoleDetail(roleId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PostMapping("/create")
    @RequirePermission(permissionId = 2, statusLevelId = 3) // ROLE, 更新
    public ResponseEntity<ApiResponse<RoleCreateResponse>> createRole(
            @Valid @RequestBody RoleCreateRequest request) {
        RoleCreateResponse data = roleService.createRole(request);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/{id}")
    @RequirePermission(permissionId = 2, statusLevelId = 3) // ROLE, 譖ｴ譁ｰ
    public ResponseEntity<ApiResponse<RoleUpdateResponse>> updateRole(
            @PathVariable("id") Integer roleId,
            @Valid @RequestBody RoleUpdateRequest request) {
        RoleUpdateResponse data = roleService.updateRole(roleId, request);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/{id}/delete")
    @RequirePermission(permissionId = 2, statusLevelId = 3) // ROLE, 譖ｴ譁ｰ
    public ResponseEntity<ApiResponse<RoleDeleteResponse>> deleteRole(
            @PathVariable("id") Integer roleId,
            @Valid @RequestBody RoleDeleteRequest request) {
        RoleDeleteResponse data = roleService.deleteRole(roleId, request);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    private String resolveFirstErrorArg(BindingResult bindingResult) {
        FieldError error = bindingResult.getFieldError();
        if (error == null) return null;
        return error.getField();
    }
}
