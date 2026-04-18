package com.example.appserver.security;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.RolePermissionModel;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.RolePermissionRepository;
import com.example.servercommon.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public CustomUserDetailsService(UserRepository userRepository,
                                    RolePermissionRepository rolePermissionRepository) {
        this.userRepository = userRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        log.debug(BackendMessageCatalog.LOG_LOADING_USER_BY_USER_ID, userId);

        UserModel user = userRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    log.warn(BackendMessageCatalog.LOG_USER_NOT_FOUND, userId);
                    return new UsernameNotFoundException(
                            BackendMessageCatalog.format(BackendMessageCatalog.EX_USER_NOT_FOUND, userId));
                });

        Integer roleId = user.getRoleId();
        if (roleId == null) {
            return new CustomUserDetails(user, Collections.emptyMap());
        }

        List<RolePermissionModel> permissionsList =
                rolePermissionRepository.findAllByRoleId(roleId);
        if (permissionsList == null || permissionsList.isEmpty()) {
            return new CustomUserDetails(user, Collections.emptyMap());
        }

        // permissionId -> statusLevelId
        Map<Integer, Integer> rolePermissions = permissionsList.stream()
                .filter(rp -> rp.getPermissionId() != null && rp.getStatusLevelId() != null)
                .collect(Collectors.toMap(
                        RolePermissionModel::getPermissionId,
                        RolePermissionModel::getStatusLevelId,
                        (a, b) -> b
                ));

        return new CustomUserDetails(user, rolePermissions);
    }
}
