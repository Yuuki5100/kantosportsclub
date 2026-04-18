-- ============================
-- 最小構成スキーマ（H2 / MySQL 両対応）
-- ============================

-- 必須ユーザー・権限
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL
);

CREATE TABLE endpoint_authority_mapping (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(100),
  method VARCHAR(6),
  menu_function_id BIGINT NOT NULL,
  required_level INT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE user_role_permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  resource VARCHAR(100) NOT NULL,
  permission_level INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テストで参照されるマスタ
CREATE TABLE master_menu_function (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255)
);

INSERT INTO master_menu_function (id, name) VALUES
(101, 'ユーザー管理'),
(102, 'レポート閲覧'),
(103, '設定変更');

-- 不要な重複 INSERT は削除済み（REQUIRED_LEVEL のない旧形式）
-- INSERT INTO endpoint_authority_mapping (url, method, menu_function_id)
-- VALUES ('/api/example', 'GET', 101);

-- メニュー機能IDとリクエストレベルの対応を定義
INSERT INTO endpoint_authority_mapping (id, url, method, menu_function_id, required_level, created_at, updated_at) VALUES
(1, '/api/example1', 'GET', 101, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '/api/example2', 'POST', 102, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '/api/example3', 'DELETE', 103, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 帳票マスタ
CREATE TABLE report_master (
  report_id VARCHAR(50) NOT NULL PRIMARY KEY,
  report_name VARCHAR(100) NOT NULL,
  template_file VARCHAR(255) NOT NULL,
  output_format INT NOT NULL,
  description VARCHAR(500),
  updated_at TIMESTAMP NOT NULL,
  updated_by VARCHAR(50) NOT NULL
);

-- 帳票レイアウト
CREATE TABLE report_layout (
  report_id VARCHAR(50) NOT NULL,
  column_id VARCHAR(50) NOT NULL,
  column_name VARCHAR(100) NOT NULL,
  display_label VARCHAR(100) NOT NULL,
  data_type INT NOT NULL,
  display_order INT NOT NULL,
  visible_flag INT NOT NULL,
  format_pattern VARCHAR(50),
  required_flag INT NOT NULL,
  default_value VARCHAR(100),
  remarks VARCHAR(500),
  updated_at TIMESTAMP NOT NULL,
  updated_by VARCHAR(50) NOT NULL,
  PRIMARY KEY (report_id, column_id),
  CONSTRAINT fk_report_layout_master FOREIGN KEY (report_id)
    REFERENCES report_master (report_id)
    ON DELETE CASCADE
);

CREATE TABLE settings (
  item VARCHAR(100) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  val VARCHAR(255) NOT NULL
);

-- 初期データ（任意）
INSERT INTO settings (item, type, val)
VALUES ('system.locale', 'string', 'ja_JP');

CREATE TABLE mail_templates (
  locale VARCHAR(10) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  PRIMARY KEY (locale, template_name)
);

-- 初期データ（必要に応じて）
INSERT INTO mail_templates (locale, template_name, subject, body)
VALUES ('ja', 'login_notification', 'ログイン通知', 'こんにちは、ログインが検出されました。');

CREATE TABLE error_codes (
  code VARCHAR(20) NOT NULL,
  locale VARCHAR(10) NOT NULL,
  message VARCHAR(255) NOT NULL,
  PRIMARY KEY (code, locale)
);

-- 初期データ（例）
INSERT INTO error_codes (code, locale, message) VALUES
('E4001', 'ja', 'バリデーション失敗'),
('E401', 'ja', '認証失敗'),
('E403', 'ja', '認証されていません');


CREATE TABLE notify_queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    ref_id BIGINT,
    notified BOOLEAN DEFAULT FALSE,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_attempted_at TIMESTAMP NULL
);
