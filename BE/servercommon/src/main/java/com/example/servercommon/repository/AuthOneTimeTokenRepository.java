package com.example.servercommon.repository;

import com.example.servercommon.model.AuthOneTimeTokenModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

public interface AuthOneTimeTokenRepository extends JpaRepository<AuthOneTimeTokenModel, Integer> {
    Optional<AuthOneTimeTokenModel> findByJti(String jti);

    Optional<AuthOneTimeTokenModel> findFirstByUserIdAndExpiresAtAfterAndUsedAtIsNullOrderByCreatedAtDesc(
            String userId,
            LocalDateTime now);
    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update AuthOneTimeTokenModel token
               set token.usedAt = :usedAt
             where token.userId = :userId
               and token.expiresAt > :now
               and token.usedAt is null
            """)
    int invalidateActiveTokensByUserId(
            @Param("userId") String userId,
            @Param("now") LocalDateTime now,
            @Param("usedAt") LocalDateTime usedAt);

}
