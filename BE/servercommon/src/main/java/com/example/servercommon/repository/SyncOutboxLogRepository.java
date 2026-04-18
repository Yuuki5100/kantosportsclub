package com.example.servercommon.repository;

import com.example.servercommon.model.SyncOutboxLog;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SyncOutboxLogRepository extends JpaRepository<SyncOutboxLog, Long> {

    Optional<SyncOutboxLog> findByRequestId(String requestId);

    @Query("""
            SELECT l FROM SyncOutboxLog l
            WHERE l.status = com.example.servercommon.enums.SyncOutboxStatus.PENDING
               OR (l.status = com.example.servercommon.enums.SyncOutboxStatus.RETRY_WAIT AND l.nextRetryAt <= :now)
            ORDER BY l.createdAt ASC
            """)
    List<SyncOutboxLog> findDispatchTargets(@Param("now") LocalDateTime now, Pageable pageable);
}
