package com.example.appserver.response.role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RolePermissionItemResponse {
    private Integer rolePermissionId;
    private Integer permissionId;
    private String permissionName;
    private Integer statusLevelId;
    private String statusLevelName;
}
