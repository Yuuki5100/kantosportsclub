-- コミュニティ削除APIの権限設定
INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (57, '/api/communities/*', 'DELETE', 209, 2);

UPDATE app_metadata
SET value = '0035_community_delete_permission', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
