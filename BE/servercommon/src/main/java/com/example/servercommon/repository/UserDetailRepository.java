package com.example.servercommon.repository;

import com.example.servercommon.model.UserDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDetailRepository extends JpaRepository<UserDetail, Long> {
    // 必要に応じてクエリメソッドを追加できます
}
