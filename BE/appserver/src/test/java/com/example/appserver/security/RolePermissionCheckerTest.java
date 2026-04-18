package com.example.appserver.security;

import com.example.servercommon.model.RolePermissionModel;
import com.example.servercommon.repository.RolePermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RolePermissionCheckerTest {

    private RolePermissionRepository rolePermissionRepository;
    private RolePermissionChecker checker;

    private static final int ROLE_ID = 1;
    private static final int PERMISSION_ID = 100;

    private static final int STATUS_NASHI = 1;
    private static final int STATUS_VIEW = 2;
    private static final int STATUS_UPDATE = 3;

    @BeforeEach
    void setUp() {
        rolePermissionRepository = mock(RolePermissionRepository.class);
        checker = new RolePermissionChecker(rolePermissionRepository);
    }

    @Test
    void shouldDenyViewWhenPermissionIsNashi() {
        mockStatusLevel(STATUS_NASHI);

        assertThrows(AccessDeniedException.class,
                () -> checker.requireAllowed(ROLE_ID, PERMISSION_ID, STATUS_VIEW));
    }

    @Test
    void shouldDenyUpdateWhenPermissionIsNashi() {
        mockStatusLevel(STATUS_NASHI);

        assertThrows(AccessDeniedException.class,
                () -> checker.requireAllowed(ROLE_ID, PERMISSION_ID, STATUS_UPDATE));
    }

    @Test
    void shouldAllowViewWhenPermissionIsView() {
        mockStatusLevel(STATUS_VIEW);

        assertDoesNotThrow(() -> checker.requireAllowed(ROLE_ID, PERMISSION_ID, STATUS_VIEW));
    }

    @Test
    void shouldDenyUpdateWhenPermissionIsView() {
        mockStatusLevel(STATUS_VIEW);

        assertThrows(AccessDeniedException.class,
                () -> checker.requireAllowed(ROLE_ID, PERMISSION_ID, STATUS_UPDATE));
    }

    @Test
    void shouldAllowViewWhenPermissionIsUpdate() {
        mockStatusLevel(STATUS_UPDATE);

        assertDoesNotThrow(() -> checker.requireAllowed(ROLE_ID, PERMISSION_ID, STATUS_VIEW));
    }

    @Test
    void shouldAllowUpdateWhenPermissionIsUpdate() {
        mockStatusLevel(STATUS_UPDATE);

        assertDoesNotThrow(() -> checker.requireAllowed(ROLE_ID, PERMISSION_ID, STATUS_UPDATE));
    }

    private void mockStatusLevel(int statusLevelId) {
        RolePermissionModel rp = new RolePermissionModel();
        rp.setRoleId(ROLE_ID);
        rp.setPermissionId(PERMISSION_ID);
        rp.setStatusLevelId(statusLevelId);

        when(rolePermissionRepository.findByRoleIdAndPermissionId(ROLE_ID, PERMISSION_ID))
                .thenReturn(Optional.of(rp));
    }
}
