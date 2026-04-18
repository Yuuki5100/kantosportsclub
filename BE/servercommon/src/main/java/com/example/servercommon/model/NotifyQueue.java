package com.example.servercommon.model;

import com.example.servercommon.enums.NotifyQueueStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 通知キューのモデル。
 * アプリケーション内部の処理にも、JPAエンティティとしても利用可能。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notify_queue")
public class NotifyQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 通知種別（例：GATE_IN, REPORT_DONE など）
     */
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    /**
     * 関連リソースのID（例：gate_event.id）
     */
    @Column(name = "ref_id")
    private Long refId;

    /**
     * 通知状態（PENDING / RETRY_WAIT / SENT / FAILED）
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private NotifyQueueStatus status = NotifyQueueStatus.PENDING;

    /**
     * 通知済みフラグ
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean notified = false;

    /**
     * 通知失敗の試行回数
     */
    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    /**
     * 最大再送回数
     */
    @Column(name = "max_retry", nullable = false)
    @Builder.Default
    private Integer maxRetry = 5;

    /**
     * レコード作成日時
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    // TODO(timezone): if notify_queue remains in scope later, migrate this default to UTC provider.
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * 最後に通知試行を行った日時
     */
    @Column(name = "last_attempted_at")
    private LocalDateTime lastAttemptedAt;

    /**
     * 次回送信予定日時
     */
    @Column(name = "next_attempt_at")
    private LocalDateTime nextAttemptAt;

    /**
     * 最終エラーメッセージ
     */
    @Column(name = "last_error_message", length = 1000)
    private String lastErrorMessage;
}
