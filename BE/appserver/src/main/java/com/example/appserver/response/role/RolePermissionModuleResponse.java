package com.example.appserver.response.role;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RolePermissionModuleResponse {
    private String module;
    private List<RolePermissionItemResponse> permissions;
}
