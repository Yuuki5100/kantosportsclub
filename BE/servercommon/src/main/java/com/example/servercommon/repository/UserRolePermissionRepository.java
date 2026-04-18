package com.example.servercommon.repository;

import com.example.servercommon.model.UserRolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRolePermissionRepository extends JpaRepository<UserRolePermission, Long> {

    Optional<UserRolePermission> findByUserIdAndResource(String userId, String resource);

    List<UserRolePermission> findAllByUserId(String userId);
}
