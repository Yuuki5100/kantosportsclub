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
