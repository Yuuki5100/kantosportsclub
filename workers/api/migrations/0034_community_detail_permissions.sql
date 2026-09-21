-- コミュニティ詳細取得・更新APIの権限設定
INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (55, '/api/communities/*', 'GET', 209, 1),
  (56, '/api/communities/*', 'PUT', 209, 2),
  (57, '/api/communities/*', 'DELETE', 209, 2);

UPDATE app_metadata
SET value = '0034_community_detail_permissions', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
