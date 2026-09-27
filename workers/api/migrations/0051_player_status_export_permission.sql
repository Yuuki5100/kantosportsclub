-- 選手ステータス CSV 出力は管理者（role_level 3）のみ利用可能にする。
INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (114, '/api/player-status/export', 'GET', 101, 3);

UPDATE app_metadata
SET value = '0051_player_status_export_permission',
    updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
