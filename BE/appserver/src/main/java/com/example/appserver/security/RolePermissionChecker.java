package com.example.appserver.security;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.repository.RolePermissionRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class RolePermissionChecker {

    private final RolePermissionRepository rolePermissionRepository;

    public RolePermissionChecker(RolePermissionRepository rolePermissionRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
    }

    public void requireAllowed(Integer roleId, int permissionId, int statusLevelId) {
        if (roleId == null) {
            throw new AccessDeniedException(BackendMessageCatalog.MSG_ACCESS_DENIED);
        }

        var rp = rolePermissionRepository.findByRoleIdAndPermissionId(roleId, permissionId)
                .orElseThrow(() -> new AccessDeniedException(BackendMessageCatalog.MSG_ACCESS_DENIED));

        Integer actualLevel = rp.getStatusLevelId();
        if (actualLevel == null || actualLevel < statusLevelId) {
            throw new AccessDeniedException(BackendMessageCatalog.MSG_ACCESS_DENIED);
        }
    }
}
