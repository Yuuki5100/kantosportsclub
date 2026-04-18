package com.example.appserver.service;

import com.example.appserver.request.role.RoleCreateRequest;
import com.example.appserver.request.role.RoleDeleteRequest;
import com.example.appserver.request.role.RolePermissionItemRequest;
import com.example.appserver.request.role.RolePermissionModuleRequest;
import com.example.appserver.request.role.RoleUpdateRequest;
import com.example.appserver.response.role.RoleDeleteResponse;
import com.example.appserver.response.role.RoleUpdateResponse;
import com.example.servercommon.exception.CustomException;
import com.example.servercommon.model.PermissionModel;
import com.example.servercommon.model.RoleModel;
import com.example.servercommon.model.RolePermissionModel;
import com.example.servercommon.model.StatusLevelModel;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RolePermissionServiceSc03Test {

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
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void SC03_UT_016_shouldFailValidationWhenRoleNameIsNull() {
        setAuthenticatedUser("admin");
        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName(null);

        assertThatThrownBy(() -> rolePermissionService.createRole(req))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4001");
    }

    @Test
    void SC03_UT_017_shouldFailValidationWhenRoleNameIsBlank() {
        setAuthenticatedUser("admin");
        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("   ");

        assertThatThrownBy(() -> rolePermissionService.createRole(req))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4001");
    }

    @Test
    void SC03_UT_018_shouldFailValidationWhenRequestIsNull() {
        assertThatThrownBy(() -> rolePermissionService.createRole(null))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4001");
    }

    @Test
    void SC03_UT_019_shouldFailValidationWhenDuplicatePermissionInCreateRequest() {
        setAuthenticatedUser("admin");
        when(roleRepository.existsByRoleName("Operator")).thenReturn(false);
        when(roleRepository.findMaxRoleId()).thenReturn(1);

        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("Operator");
        req.setPermissionDetails(List.of(module("ROLE", item(100, 2), item(100, 3))));

        assertThatThrownBy(() -> rolePermissionService.createRole(req))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4001");
    }

    @Test
    void SC03_UT_021_shouldRejectWhenRoleNameAlreadyExists() {
        setAuthenticatedUser("admin");
        when(roleRepository.existsByRoleName("Admin")).thenReturn(true);

        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("Admin");

        assertThatThrownBy(() -> rolePermissionService.createRole(req))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E409");
    }

    @Test
    void SC03_UT_022_shouldThrowNotFoundWhenRoleDoesNotExist() {
        when(roleRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rolePermissionService.getRoleDetail(999))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4041");
    }

    @Test
    void SC03_UT_023_shouldUpdateRoleFieldsWhenRoleExists() {
        setAuthenticatedUser("editor");
        RoleModel role = role(10, "OldName", "old desc", false);
        when(roleRepository.findById(10)).thenReturn(Optional.of(role));

        RoleUpdateRequest req = new RoleUpdateRequest();
        req.setRoleName("NewName");
        req.setDescription("new desc");

        RoleUpdateResponse result = rolePermissionService.updateRole(10, req);

        assertThat(result.getRoleId()).isEqualTo(10);
        ArgumentCaptor<RoleModel> captor = ArgumentCaptor.forClass(RoleModel.class);
        verify(roleRepository).save(captor.capture());
        assertThat(captor.getValue().getRoleName()).isEqualTo("NewName");
        assertThat(captor.getValue().getDescription()).isEqualTo("new desc");
        assertThat(captor.getValue().getEditorUserId()).isEqualTo("editor");
    }

    @Test
    void SC03_UT_024_shouldNotChangeUnspecifiedFields() {
        setAuthenticatedUser("editor");
        RoleModel role = role(11, "FixedName", "fixed desc", false);
        when(roleRepository.findById(11)).thenReturn(Optional.of(role));

        RoleUpdateRequest req = new RoleUpdateRequest();
        rolePermissionService.updateRole(11, req);

        ArgumentCaptor<RoleModel> captor = ArgumentCaptor.forClass(RoleModel.class);
        verify(roleRepository).save(captor.capture());
        assertThat(captor.getValue().getRoleName()).isEqualTo("FixedName");
        assertThat(captor.getValue().getDescription()).isEqualTo("fixed desc");
    }

    @Test
    void SC03_UT_025_shouldMarkRoleAsDeletedWhenDeletingRole() {
        setAuthenticatedUser("admin");
        RoleModel role = role(12, "TempRole", "desc", false);
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
    }

    @Test
    void SC03_UT_026_shouldHandleAlreadyDeletedRole() {
        RoleModel role = role(13, "Deleted", "desc", true);
        when(roleRepository.findById(13)).thenReturn(Optional.of(role));

        RoleDeleteRequest req = new RoleDeleteRequest();
        req.setDeletionReason("x");

        assertThatThrownBy(() -> rolePermissionService.deleteRole(13, req))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4001");
        verify(roleRepository, never()).save(any(RoleModel.class));
    }

    @Test
    void SC03_UT_037_shouldRejectWhenDuplicateRolePermissionExists() {
        setAuthenticatedUser("admin");
        when(roleRepository.existsByRoleName("Operator")).thenReturn(false);
        when(roleRepository.findMaxRoleId()).thenReturn(99);

        RoleCreateRequest req = new RoleCreateRequest();
        req.setRoleName("Operator");
        req.setPermissionDetails(List.of(
                module("ROLE", item(1, 2), item(1, 3))
        ));

        assertThatThrownBy(() -> rolePermissionService.createRole(req))
                .isInstanceOf(CustomException.class)
                .extracting("code")
                .isEqualTo("E4001");
    }

    private void setAuthenticatedUser(String userId) {
        User principal = new User(userId, "x", List.of(new SimpleGrantedAuthority("ROLE_TEST")));
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private RoleModel role(int id, String name, String description, boolean deleted) {
        RoleModel role = new RoleModel();
        role.setRoleId(id);
        role.setRoleName(name);
        role.setDescription(description);
        role.setIsDeleted(deleted);
        return role;
    }

    private RolePermissionModuleRequest module(String moduleName, RolePermissionItemRequest... items) {
        RolePermissionModuleRequest module = new RolePermissionModuleRequest();
        module.setModule(moduleName);
        module.setPermissions(List.of(items));
        return module;
    }

    private RolePermissionItemRequest item(int permissionId, int statusLevelId) {
        RolePermissionItemRequest item = new RolePermissionItemRequest();
        item.setPermissionId(permissionId);
        item.setStatusLevelId(statusLevelId);
        return item;
    }
}
