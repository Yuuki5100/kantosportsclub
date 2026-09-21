-- コミュニティ一覧取得の endpoint authority mapping を補正する。
-- 既存行が欠落しているDBでも確実に未ログイン参照を許可する。
INSERT OR REPLACE INTO endpoint_authority_mapping (
  id,
  url,
  method,
  menu_function_id,
  required_level
) VALUES (
  51,
  '/api/communities',
  'GET',
  209,
  0
);

UPDATE app_metadata
SET value = '0039_communities_list_permission', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
