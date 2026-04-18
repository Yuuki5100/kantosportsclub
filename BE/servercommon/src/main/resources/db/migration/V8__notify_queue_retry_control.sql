ALTER TABLE notify_queue
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

ALTER TABLE notify_queue
    ADD COLUMN max_retry INT NOT NULL DEFAULT 5;

ALTER TABLE notify_queue
    ADD COLUMN next_attempt_at DATETIME(6) NULL;

ALTER TABLE notify_queue
    ADD COLUMN last_error_message VARCHAR(1000) NULL;

UPDATE notify_queue
SET status = 'SENT'
WHERE notified = TRUE;

UPDATE notify_queue
SET status = 'PENDING'
WHERE notified = FALSE;

UPDATE notify_queue
SET next_attempt_at = COALESCE(last_attempted_at, created_at, CURRENT_TIMESTAMP(6))
WHERE notified = FALSE
  AND next_attempt_at IS NULL;

CREATE INDEX idx_notify_queue_dispatch
    ON notify_queue(notified, status, next_attempt_at, created_at);

CREATE INDEX idx_notify_queue_event_status_created
    ON notify_queue(event_type, status, created_at);
