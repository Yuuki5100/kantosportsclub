package com.example.servercommon.repository;

import com.example.servercommon.model.PermissionModel;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<PermissionModel, Integer> {
    List<PermissionModel> findAllByPermissionIdIn(Collection<Integer> permissionIds);
}
