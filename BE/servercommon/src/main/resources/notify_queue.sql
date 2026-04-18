CREATE TABLE notify_queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    ref_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notified BOOLEAN DEFAULT FALSE,
    retry_count INT DEFAULT 0,
    max_retry INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_attempted_at TIMESTAMP NULL,
    next_attempt_at TIMESTAMP NULL,
    last_error_message VARCHAR(1000) NULL
);
