-- 練習メニュー一覧取得の endpoint authority mapping を補正する。
-- GET /api/practice-menu/headers は未ログインでも参照可能。
INSERT OR REPLACE INTO endpoint_authority_mapping (
  id,
  url,
  method,
  menu_function_id,
  required_level
) VALUES (
  51,
  '/api/practice-menu/headers',
  'GET',
  208,
  0
);

UPDATE app_metadata
SET value = '0037_practice_menu_headers_permission', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
