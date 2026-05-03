-- SQLite版 DDL + テストデータDML
-- workers/api ログイン・権限確認用

PRAGMA foreign_keys = ON;

-- ============================
-- 既存テーブル削除
-- ============================

DROP TABLE IF EXISTS notify_queue;
DROP TABLE IF EXISTS error_codes;
DROP TABLE IF EXISTS mail_templates;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS report_layout;
DROP TABLE IF EXISTS report_master;
DROP TABLE IF EXISTS user_role_permissions;
DROP TABLE IF EXISTS endpoint_authority_mapping;
DROP TABLE IF EXISTS master_menu_function;
DROP TABLE IF EXISTS users;

-- ============================
-- DDL
-- ============================

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL
);

CREATE TABLE endpoint_authority_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT,
  method TEXT,
  menu_function_id INTEGER NOT NULL,
  required_level INTEGER NOT NULL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE user_role_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  resource TEXT NOT NULL,
  permission_level INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE master_menu_function (
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE report_master (
  report_id TEXT PRIMARY KEY,
  report_name TEXT NOT NULL,
  template_file TEXT NOT NULL,
  output_format INTEGER NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE report_layout (
  report_id TEXT NOT NULL,
  column_id TEXT NOT NULL,
  column_name TEXT NOT NULL,
  display_label TEXT NOT NULL,
  data_type INTEGER NOT NULL,
  display_order INTEGER NOT NULL,
  visible_flag INTEGER NOT NULL,
  format_pattern TEXT,
  required_flag INTEGER NOT NULL,
  default_value TEXT,
  remarks TEXT,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  PRIMARY KEY (report_id, column_id),
  FOREIGN KEY (report_id)
    REFERENCES report_master (report_id)
    ON DELETE CASCADE
);

CREATE TABLE settings (
  item TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  val TEXT NOT NULL
);

CREATE TABLE mail_templates (
  locale TEXT NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  PRIMARY KEY (locale, template_name)
);

CREATE TABLE error_codes (
  code TEXT NOT NULL,
  locale TEXT NOT NULL,
  message TEXT NOT NULL,
  PRIMARY KEY (code, locale)
);

CREATE TABLE notify_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  ref_id INTEGER,
  notified INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_attempted_at TEXT
);

-- ============================
-- DML: マスタ
-- ============================

INSERT INTO master_menu_function (id, name) VALUES
(101, 'TOP'),
(102, 'サマリー活動'),
(103, '設定変更'),
(201, '写真一覧'),
(202, '動画一覧'),
(203, 'ボドゲ一覧');

-- ============================
-- DML: endpoint authority mapping
-- required_level:
-- 1 = 参照
-- 2 = 更新
-- 3 = 管理
-- ============================

INSERT INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level, created_at, updated_at)
VALUES
(1, '/api/example1', 'GET', 101, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '/api/example2', 'POST', 102, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '/api/example3', 'DELETE', 103, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(10, '/api/picture', 'GET', 201, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, '/api/picture', 'POST', 201, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, '/api/picture/*', 'GET', 201, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, '/api/picture/*', 'PUT', 201, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, '/api/picture/*', 'DELETE', 201, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(20, '/api/media', 'GET', 202, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, '/api/media', 'POST', 202, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, '/api/media/*', 'GET', 202, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(23, '/api/media/*', 'PUT', 202, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, '/api/media/*', 'DELETE', 202, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(30, '/api/boardgames', 'GET', 203, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(31, '/api/boardgames', 'POST', 203, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(32, '/api/boardgames/*', 'GET', 203, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(33, '/api/boardgames/*', 'PUT', 203, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(34, '/api/boardgames/*', 'DELETE', 203, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================
-- DML: テストユーザー
-- 注意:
-- password は仮データです。
-- verifyPassword が平文比較なら password として使えます。
-- hash比較実装の場合は、実装方式に合わせて hash 値へ差し替えてください。
-- ============================

INSERT INTO users (id, username, password, email, role) VALUES
(1, 'admin', 'password', 'admin@example.com', 'ADMIN'),
(2, 'user', 'password', 'user@example.com', 'USER'),
(3, 'viewer', 'password', 'viewer@example.com', 'VIEWER');

-- ============================
-- DML: ユーザー権限
-- permission_level:
-- 1 = 参照
-- 2 = 更新
-- 3 = 管理
-- ============================

INSERT INTO user_role_permissions
  (id, user_id, resource, permission_level, created_at, updated_at)
VALUES
-- admin: 全体管理
(1, 1, '101', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, '102', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, '103', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, '201', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, '202', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 1, '203', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- user: 通常更新まで
(10, 2, '101', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 2, '102', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 2, '201', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 2, '202', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 2, '203', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- viewer: 参照のみ
(20, 3, '102', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, 3, '201', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 3, '202', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(23, 3, '203', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================
-- DML: 帳票マスタ
-- ============================

INSERT INTO report_master
  (report_id, report_name, template_file, output_format, description, updated_at, updated_by)
VALUES
('RPT001', 'ユーザー一覧', 'templates/user_list.xlsx', 1, 'ユーザー一覧帳票', CURRENT_TIMESTAMP, 'system'),
('RPT002', '権限一覧', 'templates/permission_list.xlsx', 1, '権限一覧帳票', CURRENT_TIMESTAMP, 'system');

INSERT INTO report_layout
  (
    report_id,
    column_id,
    column_name,
    display_label,
    data_type,
    display_order,
    visible_flag,
    format_pattern,
    required_flag,
    default_value,
    remarks,
    updated_at,
    updated_by
  )
VALUES
('RPT001', 'username', 'username', 'ユーザーID', 1, 1, 1, NULL, 1, NULL, NULL, CURRENT_TIMESTAMP, 'system'),
('RPT001', 'email', 'email', 'メールアドレス', 1, 2, 1, NULL, 1, NULL, NULL, CURRENT_TIMESTAMP, 'system'),
('RPT001', 'role', 'role', 'ロール', 1, 3, 1, NULL, 1, NULL, NULL, CURRENT_TIMESTAMP, 'system'),
('RPT002', 'resource', 'resource', 'リソース', 1, 1, 1, NULL, 1, NULL, NULL, CURRENT_TIMESTAMP, 'system'),
('RPT002', 'permission_level', 'permission_level', '権限レベル', 2, 2, 1, NULL, 1, NULL, NULL, CURRENT_TIMESTAMP, 'system');

-- ============================
-- DML: settings
-- ============================

INSERT INTO settings (item, type, val) VALUES
('system.locale', 'string', 'ja_JP'),
('auth.mode', 'string', 'internal'),
('auth.accessTokenExpiresInSeconds', 'number', '900'),
('auth.refreshTokenExpiresInSeconds', 'number', '2592000');

-- ============================
-- DML: mail templates
-- ============================

INSERT INTO mail_templates (locale, template_name, subject, body) VALUES
('ja', 'login_notification', 'ログイン通知', 'こんにちは、ログインが検出されました。'),
('ja', 'password_reset', 'パスワード再設定', 'パスワード再設定のリクエストを受け付けました。');

-- ============================
-- DML: error codes
-- ============================

INSERT INTO error_codes (code, locale, message) VALUES
('E4001', 'ja', 'バリデーション失敗'),
('E401', 'ja', '認証失敗'),
('E403', 'ja', '認証されていません'),
('E423', 'ja', 'アカウントがロックされています'),
('E500', 'ja', 'システムエラーが発生しました');

-- ============================
-- DML: notify queue
-- ============================

INSERT INTO notify_queue
  (id, event_type, ref_id, notified, retry_count, created_at, last_attempted_at)
VALUES
(1, 'LOGIN', 1, 0, 0, CURRENT_TIMESTAMP, NULL),
(2, 'REPORT_CREATED', 1, 0, 0, CURRENT_TIMESTAMP, NULL);


-- password = 'pasword' の bcrypt hash に更新
-- 対象: admin / user / viewer

UPDATE users
SET password = char(36) || '2b' || char(36) || '12' || char(36) || '/01HtG3h4wRQfrtMBh6K6.l6y53mWX8wjDxkuTt8C0qbDMdEHeVq2'
WHERE username = 'admin';

UPDATE users
SET password = char(36) || '2b' || char(36) || '12' || char(36) || '/01HtG3h4wRQfrtMBh6K6.l6y53mWX8wjDxkuTt8C0qbDMdEHeVq2'
WHERE username = 'user';

UPDATE users
SET password = char(36) || '2b' || char(36) || '12' || char(36) || '/01HtG3h4wRQfrtMBh6K6.l6y53mWX8wjDxkuTt8C0qbDMdEHeVq2'
WHERE username = 'viewer';

CREATE TABLE IF NOT EXISTS auth_refresh_token (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_refresh_token_user_id
ON auth_refresh_token (user_id);

CREATE INDEX IF NOT EXISTS idx_auth_refresh_token_expires_at
ON auth_refresh_token (expires_at);
