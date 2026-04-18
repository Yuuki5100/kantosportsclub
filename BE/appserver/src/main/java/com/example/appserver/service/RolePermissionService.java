package com.example.appserver.service;

import com.example.appserver.request.role.RoleCreateRequest;
import com.example.appserver.request.role.RoleDeleteRequest;
import com.example.appserver.request.role.RoleListQuery;
import com.example.appserver.request.role.RolePermissionItemRequest;
import com.example.appserver.request.role.RolePermissionModuleRequest;
import com.example.appserver.request.role.RoleUpdateRequest;
import com.example.appserver.response.role.RoleCreateResponse;
import com.example.appserver.response.role.RoleDetailResponse;
import com.example.appserver.response.role.RoleDropdownData;
import com.example.appserver.response.role.RoleDropdownResponse;
import com.example.appserver.response.role.RoleListData;
import com.example.appserver.response.role.RoleListResponse;
import com.example.appserver.response.role.RolePermissionItemResponse;
import com.example.appserver.response.role.RolePermissionModuleResponse;
import com.example.appserver.response.role.RoleDeleteResponse;
import com.example.appserver.response.role.RoleUpdateResponse;
import com.example.servercommon.exception.CustomException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.PermissionModel;
import com.example.servercommon.model.RoleModel;
import com.example.servercommon.model.RolePermissionModel;
import com.example.servercommon.model.StatusLevelModel;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.PermissionRepository;
import com.example.servercommon.repository.RolePermissionRepository;
import com.example.servercommon.repository.RoleRepository;
import com.example.servercommon.repository.StatusLevelRepository;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.utils.DateFormatUtil;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class RolePermissionService {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final StatusLevelRepository statusLevelRepository;
    private final UserRepository userRepository;

    public RoleListData getRoleList(RoleListQuery query) {
        int pageNumber = (query != null && query.getPageNumber() != null) ? query.getPageNumber() : 1;
        int pageSize = (query != null && query.getPagesize() != null) ? query.getPagesize() : 50;

        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt");
        PageRequest pageable = PageRequest.of(pageNumber - 1, pageSize, sort);

        Specification<RoleModel> spec = buildRoleListSpec(query);
        Page<RoleModel> page = (spec == null) ? roleRepository.findAll(pageable)
                : roleRepository.findAll(spec, pageable);
        List<RoleListResponse> items = page.getContent().stream()
                .map(this::toResponse)
                .toList();

        return new RoleListData(items, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public RoleDropdownData getRoleDropdown() {
        List<RoleDropdownResponse> roles = roleRepository.findAllByIsDeletedFalseOrderByRoleNameAsc()
                .stream()
                .map(role -> new RoleDropdownResponse(role.getRoleId(), role.getRoleName()))
                .toList();
        return new RoleDropdownData(roles);
    }

    private RoleListResponse toResponse(RoleModel role) {
        return new RoleListResponse(
                role.getRoleId(),
                role.getRoleName(),
                role.getDescription(),
                DateFormatUtil.utcToJst(role.getUpdatedAt())
        );
    }

    private Specification<RoleModel> buildRoleListSpec(RoleListQuery query) {
        if (query == null) return null;

        Specification<RoleModel> spec = null;

        if (StringUtils.hasText(query.getName())) {
            String term = "%" + query.getName().trim().toLowerCase() + "%";
            Specification<RoleModel> nameSpec =
                    (root, cq, cb) -> cb.like(cb.lower(root.get("roleName")), term);
            spec = (spec == null) ? nameSpec : spec.and(nameSpec);
        }

        if (Boolean.TRUE.equals(query.getIsDeleted())) {
            Specification<RoleModel> deletedSpec = (root, cq, cb) -> cb.isTrue(root.get("isDeleted"));
            spec = (spec == null) ? deletedSpec : spec.and(deletedSpec);
        }

        return spec;
    }

    @Transactional(readOnly = true)
    public RoleDetailResponse getRoleDetail(Integer roleId) {
        if (roleId == null) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_ROLE_ID);
        }

        RoleModel role = roleRepository.findById(roleId)
                .orElseThrow(() -> new CustomException(
                        BackendMessageCatalog.CODE_E4041,
                        BackendMessageCatalog.ARG_ROLE_ID_NOT_FOUND));

        List<RolePermissionModel> rolePermissions = rolePermissionRepository.findAllByRoleId(roleId);
        List<RolePermissionModuleResponse> permissionDetails = groupPermissionsByModule(rolePermissions);

        return new RoleDetailResponse(
                role.getRoleId(),
                role.getRoleName(),
                role.getIsDeleted(),
                role.getDeletionReason(),
                role.getDescription(),
                resolveUserName(role.getCreatorUserId()),
                role.getCreatorUserId(),
                DateFormatUtil.utcToJst(role.getCreatedAt()),
                resolveUserName(role.getEditorUserId()),
                role.getEditorUserId(),
                DateFormatUtil.utcToJst(role.getUpdatedAt()),
                permissionDetails
        );
    }

    @Transactional
    public RoleCreateResponse createRole(RoleCreateRequest request) {
        if (request == null) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_REQUEST);
        }
        if (!StringUtils.hasText(request.getRoleName())) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_ROLE_NAME);
        }
        String roleName = request.getRoleName().trim();
        if (roleRepository.existsByRoleName(roleName)) {
            throw new CustomException(BackendMessageCatalog.CODE_E409, BackendMessageCatalog.ARG_ROLE_NAME_ALREADY_EXISTS);
        }

        String currentUserId = getCurrentUserId();
        if (!StringUtils.hasText(currentUserId)) {
            throw new CustomException(BackendMessageCatalog.CODE_INVALID_USER, BackendMessageCatalog.MSG_INVALID_USER);
        }

        Integer maxRoleId = roleRepository.findMaxRoleId();
        int nextRoleId = (maxRoleId == null) ? 1 : maxRoleId + 1;

        RoleModel role = new RoleModel();
        role.setRoleId(nextRoleId);
        role.setRoleName(roleName);
        role.setDescription(request.getDescription());
        role.setIsDeleted(false);
        role.setDeletionReason(null);
        role.setCreatorUserId(currentUserId);
        role.setEditorUserId(currentUserId);

        roleRepository.save(role);

        List<RolePermissionModel> rolePermissions = buildRolePermissionsWithDefaults(
                nextRoleId,
                request.getPermissionDetails()
        );
        if (!rolePermissions.isEmpty()) {
            rolePermissionRepository.saveAll(rolePermissions);
        }

        return new RoleCreateResponse(nextRoleId);
    }

    @Transactional
    public RoleUpdateResponse updateRole(Integer roleId, RoleUpdateRequest request) {
        if (roleId == null) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_ROLE_ID);
        }
        if (request == null) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_REQUEST);
        }

        RoleModel role = roleRepository.findById(roleId)
                .orElseThrow(() -> new CustomException(
                        BackendMessageCatalog.CODE_E4041,
                        BackendMessageCatalog.ARG_ROLE_ID_NOT_FOUND));

        if (StringUtils.hasText(request.getRoleName())) {
            String roleName = request.getRoleName().trim();
            if (!roleName.equals(role.getRoleName()) && roleRepository.existsByRoleName(roleName)) {
                throw new CustomException(BackendMessageCatalog.CODE_E409, BackendMessageCatalog.ARG_ROLE_NAME_ALREADY_EXISTS);
            }
            role.setRoleName(roleName);
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        String currentUserId = getCurrentUserId();
        if (!StringUtils.hasText(currentUserId)) {
            throw new CustomException(BackendMessageCatalog.CODE_INVALID_USER, BackendMessageCatalog.MSG_INVALID_USER);
        }
        role.setEditorUserId(currentUserId);
        roleRepository.save(role);

        List<RolePermissionModel> updatedPermissions =
                buildRolePermissionUpdates(roleId, request.getPermissionDetails());
        if (!updatedPermissions.isEmpty()) {
            rolePermissionRepository.saveAll(updatedPermissions);
        }

        return new RoleUpdateResponse(roleId);
    }

    @Transactional
    public RoleDeleteResponse deleteRole(Integer roleId, RoleDeleteRequest request) {
        if (roleId == null) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_ROLE_ID);
        }
        if (request == null) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_REQUEST);
        }

        RoleModel role = roleRepository.findById(roleId)
                .orElseThrow(() -> new CustomException(
                        BackendMessageCatalog.CODE_E4041,
                        BackendMessageCatalog.ARG_ROLE_ID_NOT_FOUND));

        if (Boolean.TRUE.equals(role.getIsDeleted())) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_ROLE_ALREADY_DELETED);
        }

        long userCount = userRepository.countByRoleId(roleId);
        if (userCount > 0) {
            throw new CustomException(
                    BackendMessageCatalog.CODE_E4001,
                    BackendMessageCatalog.format(BackendMessageCatalog.MSG_ROLE_DELETE_BLOCKED_BY_USERS, userCount));
        }

        String currentUserId = getCurrentUserId();
        if (!StringUtils.hasText(currentUserId)) {
            throw new CustomException(BackendMessageCatalog.CODE_INVALID_USER, BackendMessageCatalog.MSG_INVALID_USER);
        }

        role.setIsDeleted(true);
        role.setDeletionReason(request.getDeletionReason());
        role.setEditorUserId(currentUserId);
        roleRepository.save(role);

        return new RoleDeleteResponse(roleId);
    }

    private List<RolePermissionModel> buildRolePermissionsWithDefaults(
            Integer roleId,
            List<RolePermissionModuleRequest> moduleRequests) {
        List<RolePermissionModel> result = new ArrayList<>();
        Set<Integer> requestedPermissionIds = new HashSet<>();
        Set<Integer> statusLevelIds = new HashSet<>();
        Map<Integer, Integer> requestedStatusMap = new LinkedHashMap<>();

        if (moduleRequests != null) {
            for (RolePermissionModuleRequest moduleReq : moduleRequests) {
                if (moduleReq == null || moduleReq.getPermissions() == null) continue;
                String module = moduleReq.getModule();
                for (RolePermissionItemRequest item : moduleReq.getPermissions()) {
                    if (item == null) continue;
                    if (item.getPermissionId() == null) {
                        throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_PERMISSION_ID);
                    }
                    if (item.getStatusLevelId() == null) {
                        throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_STATUS_LEVEL_ID);
                    }
                    Integer permissionId = item.getPermissionId();
                    if (!requestedPermissionIds.add(permissionId)) {
                        throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_DUPLICATE_PERMISSION_ID);
                    }
                    if (StringUtils.hasText(module)) {
                        requestedStatusMap.put(permissionId, item.getStatusLevelId());
                    } else {
                        requestedStatusMap.put(permissionId, item.getStatusLevelId());
                    }
                    statusLevelIds.add(item.getStatusLevelId());
                }
            }
        }

        Integer defaultStatusLevelId = 1;
        statusLevelIds.add(defaultStatusLevelId);
        Map<Integer, StatusLevelModel> statusMap = statusLevelRepository
                .findAllByStatusLevelIdIn(statusLevelIds)
                .stream()
                .collect(java.util.stream.Collectors.toMap(StatusLevelModel::getStatusLevelId, s -> s));
        if (statusMap.size() != statusLevelIds.size()) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_STATUS_LEVEL_ID);
        }

        List<PermissionModel> allPermissions = permissionRepository.findAll();
        Map<Integer, PermissionModel> permissionMap = allPermissions.stream()
                .collect(java.util.stream.Collectors.toMap(PermissionModel::getPermissionId, p -> p));

        for (Map.Entry<Integer, Integer> entry : requestedStatusMap.entrySet()) {
            if (!permissionMap.containsKey(entry.getKey())) {
                throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_PERMISSION_ID);
            }
        }

        for (PermissionModel perm : allPermissions) {
            Integer permissionId = perm.getPermissionId();
            Integer statusLevelId = requestedStatusMap.getOrDefault(permissionId, defaultStatusLevelId);
            if (!statusMap.containsKey(statusLevelId)) {
                throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_STATUS_LEVEL_ID);
            }

            RolePermissionModel rp = new RolePermissionModel();
            rp.setRoleId(roleId);
            rp.setPermissionId(permissionId);
            rp.setStatusLevelId(statusLevelId);
            result.add(rp);
        }

        return result;
    }

    private List<RolePermissionModel> buildRolePermissionUpdates(
            Integer roleId,
            List<RolePermissionModuleRequest> moduleRequests) {
        if (moduleRequests == null || moduleRequests.isEmpty()) {
            return List.of();
        }

        List<RolePermissionModel> result = new ArrayList<>();
        Set<Integer> permissionIds = new HashSet<>();
        Set<Integer> statusLevelIds = new HashSet<>();

        for (RolePermissionModuleRequest moduleReq : moduleRequests) {
            if (moduleReq == null || moduleReq.getPermissions() == null) continue;
            for (RolePermissionItemRequest item : moduleReq.getPermissions()) {
                if (item == null) continue;
                if (item.getPermissionId() == null) {
                    throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_PERMISSION_ID);
                }
                if (item.getStatusLevelId() == null) {
                    throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_STATUS_LEVEL_ID);
                }
                permissionIds.add(item.getPermissionId());
                statusLevelIds.add(item.getStatusLevelId());
            }
        }

        Map<Integer, PermissionModel> permissionMap = permissionRepository
                .findAllByPermissionIdIn(permissionIds)
                .stream()
                .collect(java.util.stream.Collectors.toMap(PermissionModel::getPermissionId, p -> p));
        if (permissionMap.size() != permissionIds.size()) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_PERMISSION_ID);
        }

        Map<Integer, StatusLevelModel> statusMap = statusLevelRepository
                .findAllByStatusLevelIdIn(statusLevelIds)
                .stream()
                .collect(java.util.stream.Collectors.toMap(StatusLevelModel::getStatusLevelId, s -> s));
        if (statusMap.size() != statusLevelIds.size()) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_STATUS_LEVEL_ID);
        }

        for (RolePermissionModuleRequest moduleReq : moduleRequests) {
            if (moduleReq == null || moduleReq.getPermissions() == null) continue;
            String module = moduleReq.getModule();
            for (RolePermissionItemRequest item : moduleReq.getPermissions()) {
                if (item == null) continue;
                PermissionModel perm = permissionMap.get(item.getPermissionId());
                if (perm == null) {
                    throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_PERMISSION_ID);
                }
                if (StringUtils.hasText(module) && !module.equals(perm.getModule())) {
                    throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_PERMISSION_MODULE_MISMATCH);
                }

                RolePermissionModel rp = rolePermissionRepository
                        .findByRoleIdAndPermissionId(roleId, item.getPermissionId())
                        .orElseThrow(() -> new CustomException(
                                BackendMessageCatalog.CODE_E4041,
                                BackendMessageCatalog.ARG_ROLE_PERMISSION_NOT_FOUND));
                rp.setStatusLevelId(item.getStatusLevelId());
                result.add(rp);
            }
        }

        return result;
    }

    private List<RolePermissionModuleResponse> groupPermissionsByModule(List<RolePermissionModel> rolePermissions) {
        if (rolePermissions == null || rolePermissions.isEmpty()) {
            return List.of();
        }

        List<RolePermissionModel> sorted = new ArrayList<>(rolePermissions);
        sorted.sort(Comparator
                .comparing((RolePermissionModel rp) -> moduleOrUnknown(rp.getPermission()))
                .thenComparing(rp -> permissionNameOrEmpty(rp.getPermission())));

        Map<String, List<RolePermissionItemResponse>> grouped = new LinkedHashMap<>();
        for (RolePermissionModel rp : sorted) {
            PermissionModel perm = rp.getPermission();
            StatusLevelModel status = rp.getStatusLevel();

            String module = moduleOrUnknown(perm);
            List<RolePermissionItemResponse> list =
                    grouped.computeIfAbsent(module, k -> new ArrayList<>());
            list.add(new RolePermissionItemResponse(
                    rp.getRolePermissionId(),
                    rp.getPermissionId(),
                    perm != null ? perm.getPermissionName() : null,
                    rp.getStatusLevelId(),
                    status != null ? status.getStatusLevelName() : null
            ));
        }

        List<RolePermissionModuleResponse> result = new ArrayList<>();
        for (Map.Entry<String, List<RolePermissionItemResponse>> entry : grouped.entrySet()) {
            result.add(new RolePermissionModuleResponse(entry.getKey(), entry.getValue()));
        }
        return result;
    }

    private String moduleOrUnknown(PermissionModel permission) {
        String module = (permission != null) ? permission.getModule() : null;
        return StringUtils.hasText(module) ? module : "unknown";
    }

    private String permissionNameOrEmpty(PermissionModel permission) {
        return (permission != null && permission.getPermissionName() != null)
                ? permission.getPermissionName()
                : "";
    }

    private String resolveUserName(String userId) {
        if (!StringUtils.hasText(userId)) return "";
        return userRepository.findById(userId)
                .map(u -> u.getSurname() + " " + u.getGivenName())
                .orElse("");
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof com.example.appserver.security.CustomUserDetails details) {
            return details.getDomainUser().getUserId();
        }
        if (principal instanceof UserModel u) {
            return u.getUserId();
        }
        if (principal instanceof org.springframework.security.core.userdetails.User springUser) {
            return springUser.getUsername();
        }
        return null;
    }
}
