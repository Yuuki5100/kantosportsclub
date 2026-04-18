package com.example.servercommon.repository;

import com.example.servercommon.model.AsyncJobExecution;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AsyncJobExecutionRepository extends JpaRepository<AsyncJobExecution, Long> {

    Optional<AsyncJobExecution> findByJobName(String jobName);

    @Query("""
            SELECT e
            FROM AsyncJobExecution e
            WHERE e.expiresAt <= :now
              AND e.status IN (
                com.example.servercommon.enums.AsyncJobExecutionStatus.COMPLETED,
                com.example.servercommon.enums.AsyncJobExecutionStatus.FAILED
              )
            ORDER BY e.expiresAt ASC
            """)
    List<AsyncJobExecution> findExpiredTargets(@Param("now") LocalDateTime now, Pageable pageable);
}
