package com.example.servercommon.repository;

import com.example.servercommon.model.SystemSetting;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE SystemSetting s
           SET s.passwordValidityDays = :passwordValidDays,
               s.passwordAttemptValidityCount = :passwordAttemptValidityCount,
               s.passwordReissueUrlExpiration = :passwordReissueUrlExpiration,
               s.numberOfRetries = :numberOfRetries,
               s.numberOfNotices = :numberOfNotices,
               s.updaterUserId = :updaterUserId,
               s.updatedDateTime = :updatedDateTime
         WHERE s.id = :id
        """)
    int updateValues(
            @Param("id") String id,
            @Param("passwordValidDays") Integer passwordValidDays,
            @Param("passwordAttemptValidityCount") Integer passwordAttemptValidityCount,
            @Param("passwordReissueUrlExpiration") Integer passwordReissueUrlExpiration,
            @Param("numberOfRetries") Integer numberOfRetries,
            @Param("numberOfNotices") Integer numberOfNotices,
            @Param("updaterUserId") String updaterUserId,
            @Param("updatedDateTime") LocalDateTime updatedDateTime);
}
