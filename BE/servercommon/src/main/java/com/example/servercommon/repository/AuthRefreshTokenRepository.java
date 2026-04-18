package com.example.servercommon.repository;

import com.example.servercommon.model.AuthRefreshTokenModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthRefreshTokenRepository extends JpaRepository<AuthRefreshTokenModel, Integer> {

    Optional<AuthRefreshTokenModel> findByJti(String jti);

    Optional<AuthRefreshTokenModel> findByUserId(String userId);

    Optional<AuthRefreshTokenModel> findByLastAccessJti(String lastAccessJti);
}
