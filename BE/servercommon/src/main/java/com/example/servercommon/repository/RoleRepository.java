package com.example.servercommon.repository;

import com.example.servercommon.model.RoleModel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface RoleRepository extends JpaRepository<RoleModel, Integer>, JpaSpecificationExecutor<RoleModel> {
    boolean existsByRoleName(String roleName);

    List<RoleModel> findAllByIsDeletedFalseOrderByRoleNameAsc();

    @Query("select max(r.roleId) from RoleModel r")
    Integer findMaxRoleId();
}
