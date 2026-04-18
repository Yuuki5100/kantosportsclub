CREATE TABLE sync_outbox_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(64) NOT NULL,
  request_type VARCHAR(100) NOT NULL,
  request_path VARCHAR(255) NOT NULL,
  payload TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  retry_count INT NOT NULL DEFAULT 0,
  next_retry_at DATETIME(6),
  last_error_message VARCHAR(1000),
  last_response_code VARCHAR(64),
  last_response_body TEXT,
  sent_at DATETIME(6),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uk_sync_outbox_log_request_id UNIQUE (request_id)
);

CREATE INDEX idx_sync_outbox_log_dispatch
  ON sync_outbox_log(status, next_retry_at, created_at);
