-- 施設マスタ一覧取得の endpoint authority mapping を補正する。
-- 既存行が欠落しているDBでも未ログイン参照を許可する。
INSERT OR REPLACE INTO endpoint_authority_mapping (
  id,
  url,
  method,
  menu_function_id,
  required_level
) VALUES (
  56,
  '/api/master_locations',
  'GET',
  30044,
  0
);

UPDATE app_metadata
SET value = '0040_master_locations_permission', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
