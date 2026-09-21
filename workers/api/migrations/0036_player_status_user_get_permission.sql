-- 選手ステータスのユーザー別GET APIを参照可能にする。
INSERT OR REPLACE INTO endpoint_authority_mapping (
  id,
  url,
  method,
  menu_function_id,
  required_level
) VALUES (
  60,
  '/api/player-status/user/*',
  'GET',
  101,
  1
);

UPDATE app_metadata
SET value = '0036_player_status_user_get_permission', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
