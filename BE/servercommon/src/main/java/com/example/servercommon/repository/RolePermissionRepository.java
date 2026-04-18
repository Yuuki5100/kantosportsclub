package com.example.servercommon.repository;

import com.example.servercommon.model.RolePermissionModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolePermissionRepository extends JpaRepository<RolePermissionModel, Integer> {
    Optional<RolePermissionModel> findByRoleIdAndPermissionId(Integer roleId, Integer permissionId);
    List<RolePermissionModel> findAllByRoleId(Integer roleId);
}
