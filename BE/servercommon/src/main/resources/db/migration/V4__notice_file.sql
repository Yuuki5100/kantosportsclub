-- Create notice_file junction table (replaces doc1_id, doc2_id, doc3_id in notice)

CREATE TABLE notice_file (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  notice_id BIGINT NOT NULL,
  file_name VARCHAR(255),
  destination_url VARCHAR(500),
  file_size DECIMAL(10,3),
  file_format VARCHAR(20),
  deleted_flag BOOLEAN NOT NULL DEFAULT FALSE,
  creator_user_id VARCHAR(100) NOT NULL,
  created_date_and_time DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updater_user_id VARCHAR(100) NOT NULL,
  updated_date_and_time DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_notice_file_notice FOREIGN KEY (notice_id) REFERENCES notice(notice_id)
);

CREATE INDEX idx_notice_file_notice_id ON notice_file(notice_id);

-- Migrate existing doc IDs from notice table into notice_file
INSERT INTO notice_file (notice_id, file_name, destination_url, file_size, file_format, deleted_flag, creator_user_id, created_date_and_time, updater_user_id, updated_date_and_time)
SELECT notice_id, SUBSTRING_INDEX(doc1_id, '/', -1), doc1_id, NULL, NULL, FALSE, creator_user_id, created_at, editor_user_id, updated_at
FROM notice WHERE doc1_id IS NOT NULL AND doc1_id <> '';

INSERT INTO notice_file (notice_id, file_name, destination_url, file_size, file_format, deleted_flag, creator_user_id, created_date_and_time, updater_user_id, updated_date_and_time)
SELECT notice_id, SUBSTRING_INDEX(doc2_id, '/', -1), doc2_id, NULL, NULL, FALSE, creator_user_id, created_at, editor_user_id, updated_at
FROM notice WHERE doc2_id IS NOT NULL AND doc2_id <> '';

INSERT INTO notice_file (notice_id, file_name, destination_url, file_size, file_format, deleted_flag, creator_user_id, created_date_and_time, updater_user_id, updated_date_and_time)
SELECT notice_id, SUBSTRING_INDEX(doc3_id, '/', -1), doc3_id, NULL, NULL, FALSE, creator_user_id, created_at, editor_user_id, updated_at
FROM notice WHERE doc3_id IS NOT NULL AND doc3_id <> '';

-- Drop old columns from notice table
ALTER TABLE notice DROP COLUMN doc1_id;
ALTER TABLE notice DROP COLUMN doc2_id;
ALTER TABLE notice DROP COLUMN doc3_id;
