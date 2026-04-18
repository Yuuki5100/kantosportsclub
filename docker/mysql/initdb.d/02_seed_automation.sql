USE app;

CREATE TABLE IF NOT EXISTS qa_seed_accounts (
  account_id VARCHAR(64) NOT NULL PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  intended_role VARCHAR(64) NOT NULL,
  intended_permission_level VARCHAR(64) NOT NULL,
  secret_var_user_id VARCHAR(64) NOT NULL,
  secret_var_password VARCHAR(64) NOT NULL,
  note VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qa_seed_targets (
  target_key VARCHAR(64) NOT NULL PRIMARY KEY,
  tool_name VARCHAR(32) NOT NULL,
  base_url VARCHAR(255) NOT NULL,
  health_path VARCHAR(255) NOT NULL,
  expected_statuses VARCHAR(64) NOT NULL,
  note VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO qa_seed_accounts (
  account_id,
  display_name,
  intended_role,
  intended_permission_level,
  secret_var_user_id,
  secret_var_password,
  note
) VALUES
  (
    'it-smoke-admin',
    'IT Smoke Admin',
    'ADMIN_OR_EQUIVALENT',
    'READ_WRITE',
    'IT_USER_ID',
    'IT_USER_PASSWORD',
    'Playwright backend連携テスト用。実値はGitLab Variablesで管理する'
  ),
  (
    'k6-smoke-user',
    'k6 Smoke User',
    'READ_ONLY_OR_EQUIVALENT',
    'READ_ONLY',
    'K6_USER_ID',
    'K6_USER_PASSWORD',
    'k6認証シナリオ拡張時に利用。未使用時は未設定でよい'
  ),
  (
    'zap-auth-user',
    'ZAP Auth User',
    'SECURITY_SCAN_ROLE',
    'SCAN_SCOPE_ONLY',
    'ZAP_AUTH_USER_ID',
    'ZAP_AUTH_USER_PASSWORD',
    '認証付きZAPを導入する場合に利用。DOCKER-T06で確定する'
  )
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  intended_role = VALUES(intended_role),
  intended_permission_level = VALUES(intended_permission_level),
  secret_var_user_id = VALUES(secret_var_user_id),
  secret_var_password = VALUES(secret_var_password),
  note = VALUES(note);

INSERT INTO qa_seed_targets (
  target_key,
  tool_name,
  base_url,
  health_path,
  expected_statuses,
  note
) VALUES
  (
    'e2e-smoke',
    'playwright',
    'http://frontend:3000',
    '/login',
    '200',
    'フォーム描画確認。認証情報不要'
  ),
  (
    'k6-smoke',
    'k6',
    'http://gateway:8888',
    '/',
    '200,401,403,404',
    'gateway rootへの疎通確認。閾値は docker/k6/smoke.js に定義'
  ),
  (
    'zap-baseline',
    'owasp-zap',
    'http://frontend-zap:3000',
    '/',
    '0-fail baseline',
    'docker/zap/zap-baseline.conf を適用した baseline scan'
  )
ON DUPLICATE KEY UPDATE
  tool_name = VALUES(tool_name),
  base_url = VALUES(base_url),
  health_path = VALUES(health_path),
  expected_statuses = VALUES(expected_statuses),
  note = VALUES(note);
