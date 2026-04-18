package com.example.appserver.request.role;

import java.util.List;
import lombok.Data;

@Data
public class RolePermissionModuleRequest {
    private String module;
    private List<RolePermissionItemRequest> permissions;
}
