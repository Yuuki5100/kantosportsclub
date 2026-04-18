package com.example.servercommon.repository;

import com.example.servercommon.enums.NotifyQueueStatus;
import com.example.servercommon.model.NotifyQueue;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotifyQueueRepository extends JpaRepository<NotifyQueue, Long> {

    NotifyQueue findByRefIdAndNotifiedFalse(Long refId);

    /**
     * 未通知のレコードを作成日時昇順で最大100件取得する。
     */
    List<NotifyQueue> findTop100ByNotifiedFalseOrderByCreatedAtAsc();

    /**
     * 未通知のレコードを作成日時昇順で指定件数取得する。
     */
    List<NotifyQueue> findByNotifiedFalseOrderByCreatedAtAsc(Pageable pageable);

    @Query("""
            SELECT q
              FROM NotifyQueue q
             WHERE q.notified = false
               AND q.status IN :statuses
               AND (q.nextAttemptAt IS NULL OR q.nextAttemptAt <= :now)
             ORDER BY q.createdAt ASC
            """)
    List<NotifyQueue> findDispatchTargets(
            @Param("statuses") Collection<NotifyQueueStatus> statuses,
            @Param("now") LocalDateTime now,
            Pageable pageable);

    Optional<NotifyQueue> findTop1ByRefIdAndStatusInOrderByCreatedAtDesc(Long refId, Collection<NotifyQueueStatus> statuses);

    /**
     * 指定された eventType の中で、通知済みの最新レコードを取得する。
     */
    Optional<NotifyQueue> findTop1ByEventTypeAndNotifiedTrueOrderByCreatedAtDesc(String eventType);

    Optional<NotifyQueue> findTop1ByEventTypeAndStatusOrderByCreatedAtDesc(String eventType, NotifyQueueStatus status);

    int deleteByNotifiedTrueAndCreatedAtBefore(LocalDateTime threshold);

}
