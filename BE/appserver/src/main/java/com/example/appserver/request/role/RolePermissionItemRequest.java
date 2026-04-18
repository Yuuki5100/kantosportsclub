package com.example.appserver.request.role;

import lombok.Data;

@Data
public class RolePermissionItemRequest {
    private Integer permissionId;
    private Integer statusLevelId;
}
