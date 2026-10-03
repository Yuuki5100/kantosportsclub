-- 選手ステータス更新 API を role_level 2 以上に許可する。
-- 0041_endpoint_authority_full_sync.sql で設定が抜けていたため追加する。
INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (115, '/api/player-status/user/*', 'PUT', 101, 2);

UPDATE app_metadata
SET value = '0052_player_status_update_permission',
    updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
