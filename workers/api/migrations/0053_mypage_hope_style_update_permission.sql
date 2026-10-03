-- 選手ステータス画面からの希望スタイル更新を管理者（role_level 3）に許可する。
-- 0041_endpoint_authority_full_sync.sql で設定が抜けていたため追加する。
INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (116, '/api/mypage/*/hope-style', 'PUT', 205, 3);

UPDATE app_metadata
SET value = '0053_mypage_hope_style_update_permission',
    updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
