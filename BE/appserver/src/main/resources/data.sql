SELECT 1;

-- -- 管理者ユーザー（admin）の登録
-- INSERT INTO "user" (username, password, email, role)
-- VALUES ('admin', '$2a$10$adminHashExample...', 'admin@example.com', 'SYSTEM_ADMIN');

-- -- testtaro ユーザーの登録（カスタム権限用）
-- INSERT INTO "user" (username, password, email, role)
-- VALUES ('testtaro', '$2a$10$testtaroHashExample...', 'testtaro@example.com', 'CUSTOM');

-- -- ※ 自動採番の場合、上記で testtaro の id が 2 であると仮定しています。

-- -- testtaro ユーザーに対するカスタム権限の登録（すべてのエンドポイントに対して権限レベル3）
-- INSERT INTO user_role_permissions (user_id, resource, permission_level) VALUES (2, '/user', 3);
-- INSERT INTO user_role_permissions (user_id, resource, permission_level) VALUES (2, '/admin', 3);
-- INSERT INTO user_role_permissions (user_id, resource, permission_level) VALUES (2, '/user/profile', 3);
-- INSERT INTO user_role_permissions (user_id, resource, permission_level) VALUES (2, '/user/update', 3);
-- INSERT INTO user_role_permissions (user_id, resource, permission_level) VALUES (2, '/user/create', 3);

-- 上記と同じくuser_role_permissionsにレコードを追加
-- 以下レコードが無いとカスタム権限機能が動作しません
INSERT INTO user_role_permissions (user_id, resource, permission_level)
SELECT 2, 'user', 1
WHERE NOT EXISTS (
  SELECT 1 FROM user_role_permissions
  WHERE user_id = 2 AND resource = 'user' AND permission_level = 1
);

-- ---------------------------------------------------------------------------
-- Login bootstrap data (simple user_id: admin)
-- login request:
--   { "user_id": "admin", "password": "password" }
-- ---------------------------------------------------------------------------
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO roles (
  role_id,
  creator_user_id,
  editor_user_id,
  role_name,
  description,
  is_deleted
)
SELECT
  1,
  'admin',
  'admin',
  'SYSTEM_ADMIN',
  'Bootstrap system administrator role',
  b'0'
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE role_id = 1
);

INSERT INTO users (
  user_id,
  creator_user_id,
  editor_user_id,
  email,
  failed_login_attempts,
  given_name,
  surname,
  is_deleted,
  is_locked_out,
  password,
  role_id
)
SELECT
  'admin',
  'admin',
  'admin',
  'admin@example.com',
  0,
  'Admin',
  'User',
  b'0',
  b'0',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE user_id = 'admin'
);

-- Existing admin row may remain with an old hash/lock state.
-- Force the login baseline on every startup for local development.
UPDATE users
SET
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  role_id = 1,
  is_deleted = b'0',
  is_locked_out = b'0',
  failed_login_attempts = 0,
  editor_user_id = 'admin'
WHERE user_id = 'admin';

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
