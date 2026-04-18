package com.example.appserver.service;

import com.example.appserver.request.role.RoleCreateRequest;
import com.example.appserver.request.role.RoleDeleteRequest;
import com.example.appserver.request.role.RolePermissionItemRequest;
import com.example.appserver.request.role.RolePermissionModuleRequest;
import com.example.appserver.request.role.RoleUpdateRequest;
import com.example.appserver.response.role.RoleCreateResponse;
import com.example.appserver.response.role.RoleDeleteResponse;
import com.example.appserver.response.role.RoleDetailResponse;
import com.example.appserver.response.role.RoleDropdownData;
import com.example.appserver.response.role.RoleListData;
import com.example.servercommon.exception.CustomException;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RolePermissionServiceTest {

    @Mock
    private RoleRepository roleRepository;
    @Mock
    private RolePermissionRepository rolePermissionRepository;
    @Mock
    private PermissionRepository permissionRepository;
    @Mock
    private StatusLevelRepository statusLevelRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RolePermissionService rolePermissionService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void cleanUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void SC01_UT_SVC_001_shouldUseDefaultPagingWhenQueryNull() {
        RoleModel role = role(1, "Admin", false);
        role.setUpdatedAt(LocalDateTime.now());
        Page<RoleModel> page = new PageImpl<>(List.of(role));
        when(roleRepository.findAll(any(PageRequest.class))).thenReturn(page);

        RoleListData result = rolePermissionService.getRoleList(null);

        ArgumentCaptor<PageRequest> captor = ArgumentCaptor.forClass(PageRequest.class);
        verify(roleRepository).findAll(captor.capture());
        PageRequest pageable = captor.getValue();
        assertThat(pageable.getPageNumber()).isEqualTo(0);
        assertThat(pageable.getPageSize()).isEqualTo(50);
        Sort.Order order = pageable.getSort().getOrderFor("updatedAt");
        assertThat(order).isNotNull();
        assertThat(order.getDirection()).isEqualTo(Sort.Direction.DESC);
        assertThat(result.getTotal()).isEqualTo(1);
    }

    @Test
    void SC01_UT_SVC_002_shouldReturnRoleDropdownOnlyNonDeleted() {
        when(roleRepository.findAllByIsDeletedFalseOrderByRoleNameAsc())
                .thenReturn(List.of(role(2, "Editor", false), role(3, "Viewer", false)));

        RoleDropdownData result = rolePermissionService.getRoleDropdown();

        assertThat(result.getRoles()).hasSize(2);
        assertThat(result.getRoles().get(0).getRoleName()).isEqualTo("Editor");
        assertThat(result.getRoles().get(1).getRoleName()).isEqualTo("Viewer");
    }

    @Test
    void SC01_UT_SVC_003_shouldThrowWhenRoleDetailRoleIdNull() {
        assertThatThrownBy(() -> rolePermissionService.getRoleDetail(null))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4001");
    }

    @Test
    void SC01_UT_SVC_004_shouldThrowWhenRoleDetailRoleNotFound() {
        when(roleRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rolePermissionService.getRoleDetail(99))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4041");
    }

    @Test
    void SC01_UT_SVC_005_shouldGroupRoleDetailPermissionsByModule() {
        RoleModel role = role(9, "Operator", false);
        role.setCreatorUserId("admin");
        role.setEditorUserId("admin");
        role.setCreatedAt(LocalDateTime.now().minusDays(1));
        role.setUpdatedAt(LocalDateTime.now());
        when(roleRepository.findById(9)).thenReturn(Optional.of(role));
        when(userRepository.findById("admin")).thenReturn(Optional.of(user("admin", "System", "Admin")));

        PermissionModel p1 = permission(100, "List Users", "USER");
        PermissionModel p2 = permission(200, "Edit Role", "ROLE");
        StatusLevelModel s1 = status(1, "VIEW");
        StatusLevelModel s3 = status(3, "UPDATE");

        RolePermissionModel rp1 = rolePermission(9, 100, 1, p1, s1);
        RolePermissionModel rp2 = rolePermission(9, 200, 3, p2, s3);
        when(rolePermissionRepository.findAllByRoleId(9)).thenReturn(List.of(rp1, rp2));

        RoleDetailResponse result = rolePermissionService.getRoleDetail(9);

        assertThat(result.getRoleId()).isEqualTo(9);
        assertThat(result.getPermissionDetails()).hasSize(2);
        assertThat(result.getPermissionDetails()).extracting("module").containsExactly("ROLE", "USER");
    }

    @Test
    void SC01_UT_SVC_006_shouldCreateRoleWithDefaultPermissionStatus() {
        setAuthenticatedUser("admin-user");
        when(roleRepository.existsByRoleName("Operator")).thenReturn(false);
        when(roleRepository.findMaxRoleId()).thenReturn(10);

        PermissionModel p1 = permission(100, "Role Screen", "ROLE");
        PermissionModel p2 = permission(200, "User Screen", "USER");
        when(permissionRepository.findAll()).thenReturn(List.of(p1, p2));

        when(statusLevelRepository.findAllByStatusLevelIdIn(anyCollection()))
                .thenReturn(List.of(status(1, "none"), status(3, "update")));

        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("Operator");
        req.setDescription("role for operator");
        req.setPermissionDetails(List.of(module("ROLE", item(100, 3))));

        RoleCreateResponse result = rolePermissionService.createRole(req);

        assertThat(result.getRoleId()).isEqualTo(11);

        ArgumentCaptor<RoleModel> roleCaptor = ArgumentCaptor.forClass(RoleModel.class);
        verify(roleRepository).save(roleCaptor.capture());
        assertThat(roleCaptor.getValue().getRoleId()).isEqualTo(11);
        assertThat(roleCaptor.getValue().getCreatorUserId()).isEqualTo("admin-user");

        ArgumentCaptor<List<RolePermissionModel>> rpCaptor = ArgumentCaptor.forClass(List.class);
        verify(rolePermissionRepository).saveAll(rpCaptor.capture());
        List<RolePermissionModel> saved = rpCaptor.getValue();
        assertThat(saved).hasSize(2);
        assertThat(saved).filteredOn(rp -> rp.getPermissionId() == 100).first()
                .extracting(RolePermissionModel::getStatusLevelId).isEqualTo(3);
        assertThat(saved).filteredOn(rp -> rp.getPermissionId() == 200).first()
                .extracting(RolePermissionModel::getStatusLevelId).isEqualTo(1);
    }

    @Test
    void SC01_UT_SVC_007_shouldThrowWhenCreateRolePermissionIdDuplicated() {
        setAuthenticatedUser("admin-user");
        when(roleRepository.existsByRoleName("Operator")).thenReturn(false);
        when(roleRepository.findMaxRoleId()).thenReturn(3);

        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("Operator");
        req.setPermissionDetails(List.of(
                module("ROLE", item(100, 2), item(100, 3))
        ));

        assertThatThrownBy(() -> rolePermissionService.createRole(req))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4001");
    }

    @Test
    void SC01_UT_SVC_008_shouldThrowWhenUpdateRoleModuleMismatch() {
        setAuthenticatedUser("admin-user");
        RoleModel current = role(7, "Operator", false);
        when(roleRepository.findById(7)).thenReturn(Optional.of(current));
        when(permissionRepository.findAllByPermissionIdIn(anyCollection()))
                .thenReturn(List.of(permission(500, "View Users", "USER")));
        when(statusLevelRepository.findAllByStatusLevelIdIn(anyCollection()))
                .thenReturn(List.of(status(2, "READ")));

        RoleUpdateRequest req = new RoleUpdateRequest();
        req.setPermissionDetails(List.of(module("ROLE", item(500, 2))));

        assertThatThrownBy(() -> rolePermissionService.updateRole(7, req))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4001");
    }

    @Test
    void SC01_UT_SVC_009_shouldThrowWhenDeleteRoleHasAssignedUsers() {
        RoleModel role = role(8, "Viewer", false);
        when(roleRepository.findById(8)).thenReturn(Optional.of(role));
        when(userRepository.countByRoleId(8)).thenReturn(2L);

        RoleDeleteRequest req = new RoleDeleteRequest();
        req.setDeletionReason("cleanup");

        assertThatThrownBy(() -> rolePermissionService.deleteRole(8, req))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4001");
    }

    @Test
    void SC01_UT_SVC_010_shouldSoftDeleteRoleWhenNoAssignedUsers() {
        setAuthenticatedUser("admin-user");
        RoleModel role = role(12, "TempRole", false);
        when(roleRepository.findById(12)).thenReturn(Optional.of(role));
        when(userRepository.countByRoleId(12)).thenReturn(0L);

        RoleDeleteRequest req = new RoleDeleteRequest();
        req.setDeletionReason("obsolete");

        RoleDeleteResponse result = rolePermissionService.deleteRole(12, req);

        assertThat(result.getRoleId()).isEqualTo(12);
        ArgumentCaptor<RoleModel> captor = ArgumentCaptor.forClass(RoleModel.class);
        verify(roleRepository).save(captor.capture());
        assertThat(captor.getValue().getIsDeleted()).isTrue();
        assertThat(captor.getValue().getDeletionReason()).isEqualTo("obsolete");
        assertThat(captor.getValue().getEditorUserId()).isEqualTo("admin-user");
        verify(rolePermissionRepository, never()).saveAll(any());
    }

    private void setAuthenticatedUser(String userId) {
        User principal = new User(userId, "x", List.of(new SimpleGrantedAuthority("ROLE_TEST")));
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private RoleModel role(int id, String name, boolean deleted) {
        RoleModel r = new RoleModel();
        r.setRoleId(id);
        r.setRoleName(name);
        r.setIsDeleted(deleted);
        r.setDescription("desc");
        return r;
    }

    private UserModel user(String id, String surname, String givenName) {
        UserModel u = new UserModel();
        u.setUserId(id);
        u.setSurname(surname);
        u.setGivenName(givenName);
        return u;
    }

    private PermissionModel permission(int id, String name, String module) {
        PermissionModel p = new PermissionModel();
        p.setPermissionId(id);
        p.setPermissionName(name);
        p.setModule(module);
        return p;
    }

    private StatusLevelModel status(int id, String name) {
        StatusLevelModel s = new StatusLevelModel();
        s.setStatusLevelId(id);
        s.setStatusLevelName(name);
        return s;
    }

    private RolePermissionModel rolePermission(
            int roleId,
            int permissionId,
            int statusLevelId,
            PermissionModel permission,
            StatusLevelModel statusLevel) {
        RolePermissionModel rp = new RolePermissionModel();
        rp.setRoleId(roleId);
        rp.setPermissionId(permissionId);
        rp.setStatusLevelId(statusLevelId);
        rp.setPermission(permission);
        rp.setStatusLevel(statusLevel);
        return rp;
    }

    private RolePermissionModuleRequest module(String moduleName, RolePermissionItemRequest... items) {
        RolePermissionModuleRequest module = new RolePermissionModuleRequest();
        module.setModule(moduleName);
        module.setPermissions(List.of(items));
        return module;
    }

    private RolePermissionItemRequest item(int permissionId, int statusLevelId) {
        RolePermissionItemRequest i = new RolePermissionItemRequest();
        i.setPermissionId(permissionId);
        i.setStatusLevelId(statusLevelId);
        return i;
    }
}
