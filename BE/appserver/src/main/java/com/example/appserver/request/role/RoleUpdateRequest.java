package com.example.appserver.request.role;

import java.util.List;
import lombok.Data;

@Data
public class RoleUpdateRequest {
    private String roleName;
    private String description;
    private List<RolePermissionModuleRequest> permissionDetails;
}
