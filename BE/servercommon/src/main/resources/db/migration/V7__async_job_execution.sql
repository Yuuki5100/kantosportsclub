CREATE TABLE async_job_execution (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  job_name VARCHAR(255) NOT NULL,
  job_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  artifact_path VARCHAR(500),
  artifact_mime_type VARCHAR(255),
  error_message VARCHAR(1000),
  started_at DATETIME(6),
  ended_at DATETIME(6),
  expires_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uk_async_job_execution_job_name UNIQUE (job_name)
);

CREATE INDEX idx_async_job_execution_expires_at
  ON async_job_execution(expires_at);

CREATE INDEX idx_async_job_execution_status
  ON async_job_execution(status);

