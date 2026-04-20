-- Notice feature tables and permissions

CREATE TABLE notice (
  notice_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  notice_title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contents VARCHAR(250),
  doc1_id VARCHAR(255),
  doc2_id VARCHAR(255),
  doc3_id VARCHAR(255),
  creator_user_id CHAR(36) NOT NULL,
  editor_user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_notice_end_date ON notice(end_date);

INSERT INTO master_menu_function (id, name) VALUES
(9001, 'NOTICE_VIEW'),
(9002, 'NOTICE_EDIT');

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level, created_at, updated_at) VALUES
('/api/notice/list', 'GET', 9001, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('/api/notice/notice_id', 'GET', 9001, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('/api/notice/create', 'POST', 9002, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('/api/notice/notice_id', 'PUT', 9002, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('/api/notice/upload', 'POST', 9002, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('/api/notice/download/{id}', 'GET', 9001, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
