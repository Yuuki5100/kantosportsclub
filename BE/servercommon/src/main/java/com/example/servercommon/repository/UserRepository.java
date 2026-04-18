package com.example.servercommon.repository;

import com.example.servercommon.model.UserModel;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserRepository extends JpaRepository<UserModel, String>, JpaSpecificationExecutor<UserModel> {
    // 荳ｻ繧ｭ繝ｼ(user_id)縺ｧ讀懃ｴ｢縺吶ｋ縺ｪ繧・findById(...) 縺ｧ雜ｳ繧翫ｋ縺後・    // 蜻ｼ縺ｳ蜃ｺ縺怜・縺ｮ蜿ｯ隱ｭ諤ｧ縺ｮ縺溘ａ縺ｫ alias 繧堤畑諢上＠縺ｦ繧０K
    Optional<UserModel> findByUserId(String userId);

    boolean existsByUserId(String userId);

    // 蠢・ｦ√↑繧・
    Optional<UserModel> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRoleId(Integer roleId);

}
