package com.example.appserver.security;

import com.example.appserver.permission.PermissionConfigProvider;
import com.example.appserver.permission.PermissionConfigProvider.EndpointPermissions;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.model.RolePermissionModel;
import com.example.servercommon.repository.RolePermissionRepository;
import com.example.servercommon.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Collections;

@Component("permissionChecker")
public class PermissionChecker {

    private final UserRepository userRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionConfigProvider permissionConfigProvider;

    public PermissionChecker(UserRepository userRepository,
                             RolePermissionRepository rolePermissionRepository,
                             PermissionConfigProvider permissionConfigProvider) {
        this.userRepository = userRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.permissionConfigProvider = permissionConfigProvider;
    }

    public boolean checkPermission(Authentication authentication, String method, String path, int requiredLevel) {
        if (authentication == null || !authentication.isAuthenticated()) return false;

        Object principal = authentication.getPrincipal();
        UserContext userContext = resolveUserContext(principal);
        UserModel user = userContext.user();
        if (user == null || user.getRoleId() == null) return false;

        // SYSTEM_ADMIN is always allowed.
        if (user.getRoleId() == UserRole.SYSTEM_ADMIN.getRoleId()) return true;

        Optional<EndpointPermissions> matched = permissionConfigProvider.findEndpointPermissions(method, path);
        if (matched.isEmpty()) return false;

        EndpointPermissions matchedPermission = matched.get();
        if (isAllowedByRolePermission(matchedPermission, userContext.rolePermissions(), requiredLevel)) {
            return true;
        }

        String roleKey = String.valueOf(user.getRoleId());
        String roleName = resolveRoleName(user.getRoleId());
        return Optional.ofNullable(matchedPermission.getPermissions()).orElse(Collections.emptyList()).stream()
                .anyMatch(r -> r != null && (r.equalsIgnoreCase(roleKey)
                        || (roleName != null && r.equalsIgnoreCase(roleName))));
    }

    public boolean checkPermission(Authentication authentication, String method, String path) {
        String requestKey = method.toUpperCase() + " " + path;
        int defaultRequiredLevel = permissionConfigProvider.getRequiredLevel(requestKey);
        return checkPermission(authentication, method, path, defaultRequiredLevel);
    }

    public boolean hasEndpointPermissionDefinition(String method, String path) {
        return permissionConfigProvider.findEndpointPermissions(method, path).isPresent();
    }

    private boolean isAllowedByRolePermission(EndpointPermissions matchedPermission,
                                              Map<Integer, Integer> userRolePermissions,
                                              int requiredLevel) {
        Map<String, Integer> endpointCustom = matchedPermission.getCustom();
        if (endpointCustom == null || endpointCustom.isEmpty()) return false;
        if (userRolePermissions == null || userRolePermissions.isEmpty()) return false;

        for (Map.Entry<String, Integer> entry : endpointCustom.entrySet()) {
            try {
                Integer permissionId = Integer.valueOf(entry.getKey());
                Integer userLevel = userRolePermissions.get(permissionId);
                if (userLevel == null) {
                    continue;
                }
                int endpointRequired = Optional.ofNullable(entry.getValue()).orElse(0);
                int effectiveRequired = Math.max(Math.max(requiredLevel, 0), endpointRequired);
                if (userLevel >= effectiveRequired) return true;
            } catch (NumberFormatException ignored) {
                // Skip non-numeric keys that are not DB menuFunctionId.
            }
        }
        return false;
    }

    private UserContext resolveUserContext(Object principal) {
        if (principal instanceof CustomUserDetails details) {
            Map<Integer, Integer> permissions = Optional.ofNullable(details.getRolePermissions())
                    .orElse(Collections.emptyMap());
            return new UserContext(details.getDomainUser(), permissions);
        }
        if (principal instanceof UserModel u) {
            return new UserContext(u, loadRolePermissions(u.getRoleId()));
        }
        if (principal instanceof org.springframework.security.core.userdetails.User springUser) {
            String userId = springUser.getUsername();
            UserModel user = userRepository.findByUserId(userId).orElse(null);
            if (user == null) {
                return new UserContext(null, Collections.emptyMap());
            }
            return new UserContext(user, loadRolePermissions(user.getRoleId()));
        }
        return new UserContext(null, Collections.emptyMap());
    }

    private Map<Integer, Integer> loadRolePermissions(Integer roleId) {
        if (roleId == null) {
            return Collections.emptyMap();
        }
        Map<Integer, Integer> result = new HashMap<>();
        for (RolePermissionModel rp : rolePermissionRepository.findAllByRoleId(roleId)) {
            if (rp.getPermissionId() != null && rp.getStatusLevelId() != null) {
                result.put(rp.getPermissionId(), rp.getStatusLevelId());
            }
        }
        return result;
    }

    private String resolveRoleName(Integer roleId) {
        if (roleId == null) return null;
        for (UserRole r : UserRole.values()) {
            if (r.getRoleId() == roleId) return r.name().toUpperCase(Locale.ROOT);
        }
        return null;
    }

    private record UserContext(UserModel user, Map<Integer, Integer> rolePermissions) {
    }
}
