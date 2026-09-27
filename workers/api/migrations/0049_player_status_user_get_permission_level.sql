-- 選手ステータス設定画面のユーザー別取得 API は管理者（role_level 3）のみ参照可能にする。
UPDATE endpoint_authority_mapping
SET required_level = 3,
    updated_at = CURRENT_TIMESTAMP
WHERE url = '/api/player-status/user/*'
  AND method = 'GET';

UPDATE app_metadata
SET value = '0049_player_status_user_get_permission_level',
    updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
