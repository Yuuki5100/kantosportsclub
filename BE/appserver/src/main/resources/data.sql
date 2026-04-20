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
--   { "user_id": "admin", "password": "password123" }
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
  '$2a$10$NSzWQt4Qwnh.qyTrX5HboedkPpuSfxVJtHV2KacITM/5iy7HrhhMO',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE user_id = 'admin'
);

-- Existing admin row may remain with an old hash/lock state.
-- Force the login baseline on every startup for local development.
UPDATE users
SET
  password = '$2a$10$NSzWQt4Qwnh.qyTrX5HboedkPpuSfxVJtHV2KacITM/5iy7HrhhMO',
  role_id = 1,
  is_deleted = b'0',
  is_locked_out = b'0',
  failed_login_attempts = 0,
  editor_user_id = 'admin'
WHERE user_id = 'admin';

-- Explicit login recovery update for local development
UPDATE users
SET
  password = '$2a$10$NSzWQt4Qwnh.qyTrX5HboedkPpuSfxVJtHV2KacITM/5iy7HrhhMO',
  failed_login_attempts = 0,
  is_locked_out = b'0',
  is_deleted = b'0'
WHERE user_id = 'admin';

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- ---------------------------------------------------------------------------
-- Frontend page transition authority mappings
-- source:
--   FE/spa-next/my-next-app/src/pages
--   FE/spa-next/my-next-app/src/config/PageConfig.tsx
-- note:
--   /reset-password/[token] is stored as /reset-password/** for path matching
-- ---------------------------------------------------------------------------
INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/', 'GET', 30001, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/login', 'GET', 30002, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/login'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/callback', 'GET', 30003, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/callback'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/forgot-password', 'GET', 30004, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/forgot-password'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/reset-password/**', 'GET', 30005, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/reset-password/**'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/403', 'GET', 30006, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/403'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/404', 'GET', 30007, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/404'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/admin/user/list', 'GET', 30011, 2
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/admin/user/list'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/user/list', 'GET', 30012, 2
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/user/list'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/user/detail', 'GET', 30013, 2
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/user/detail'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/role/list', 'GET', 30014, 2
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/role/list'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/role/detail', 'GET', 30015, 2
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/role/detail'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/manual/list', 'GET', 30016, 2
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/manual/list'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/manual/detail', 'GET', 30017, 2
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/manual/detail'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/settings', 'GET', 30018, 2
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/settings'
);

-- Other routable pages found under src/pages (not in PageConfig)
INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/Top', 'GET', 30030, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/Top'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/admin/admin', 'GET', 30031, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/admin/admin'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/BulkExportForm', 'GET', 30032, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/BulkExportForm'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/component/Component', 'GET', 30033, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/component/Component'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/errorCode', 'GET', 30034, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/errorCode'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/input/input', 'GET', 30035, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/input/input'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/mailTemplete', 'GET', 30036, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/mailTemplete'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/myPage/myPage', 'GET', 30037, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/myPage/myPage'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/notice/NoticeDetailPopup', 'GET', 30038, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/notice/NoticeDetailPopup'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/oidcLoginTest', 'GET', 30039, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/oidcLoginTest'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/report/report', 'GET', 30040, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/report/report'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/telephone', 'GET', 30041, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/telephone'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/test', 'GET', 30042, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/test'
);

INSERT INTO endpoint_authority_mapping (url, method, menu_function_id, required_level)
SELECT '/user/user', 'GET', 30043, 0
WHERE NOT EXISTS (
  SELECT 1 FROM endpoint_authority_mapping WHERE method = 'GET' AND url = '/user/user'
);
