package com.example.appserver.security;

import com.example.servercommon.model.RolePermissionModel;
import com.example.servercommon.repository.RolePermissionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RolePermissionCheckerSc03Test {

    @Mock
    private RolePermissionRepository rolePermissionRepository;

    @InjectMocks
    private RolePermissionChecker rolePermissionChecker;

    @Test
    void SC03_UT_030_shouldDenyWhenRoleIdIsNull() {
        assertThatThrownBy(() -> rolePermissionChecker.requireAllowed(null, 2, 1))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void SC03_UT_031_shouldDenyWhenPermissionRecordMissing() {
        when(rolePermissionRepository.findByRoleIdAndPermissionId(10, 2)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rolePermissionChecker.requireAllowed(10, 2, 1))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void SC03_UT_032_shouldDenyWhenStatusIsLowerThanRequiredView() {
        RolePermissionModel rp = new RolePermissionModel();
        rp.setStatusLevelId(1);
        when(rolePermissionRepository.findByRoleIdAndPermissionId(10, 2)).thenReturn(Optional.of(rp));

        assertThatThrownBy(() -> rolePermissionChecker.requireAllowed(10, 2, 2))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void SC03_UT_033_shouldAllowWhenStatusMeetsView() {
        RolePermissionModel rp = new RolePermissionModel();
        rp.setStatusLevelId(2);
        when(rolePermissionRepository.findByRoleIdAndPermissionId(10, 2)).thenReturn(Optional.of(rp));

        assertThatCode(() -> rolePermissionChecker.requireAllowed(10, 2, 2))
                .doesNotThrowAnyException();
    }

    @Test
    void SC03_UT_034_shouldAllowWhenStatusMeetsUpdate() {
        RolePermissionModel rp = new RolePermissionModel();
        rp.setStatusLevelId(3);
        when(rolePermissionRepository.findByRoleIdAndPermissionId(10, 2)).thenReturn(Optional.of(rp));

        assertThatCode(() -> rolePermissionChecker.requireAllowed(10, 2, 3))
                .doesNotThrowAnyException();
    }

    @Test
    void SC03_UT_035_shouldDenyWhenUpdateRequiredButOnlyViewGranted() {
        RolePermissionModel rp = new RolePermissionModel();
        rp.setStatusLevelId(2);
        when(rolePermissionRepository.findByRoleIdAndPermissionId(10, 2)).thenReturn(Optional.of(rp));

        assertThatThrownBy(() -> rolePermissionChecker.requireAllowed(10, 2, 3))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void SC03_UT_036_shouldDenyWhenStatusLevelIsUnknownNull() {
        RolePermissionModel rp = new RolePermissionModel();
        rp.setStatusLevelId(null);
        when(rolePermissionRepository.findByRoleIdAndPermissionId(10, 2)).thenReturn(Optional.of(rp));

        assertThatThrownBy(() -> rolePermissionChecker.requireAllowed(10, 2, 1))
                .isInstanceOf(AccessDeniedException.class);
    }
}
