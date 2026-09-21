-- コミュニティ一覧とリンクプレビューは未ログインでも利用可能にする。
UPDATE endpoint_authority_mapping
SET required_level = 0
WHERE method = 'GET'
  AND url IN ('/api/communities', '/api/communities/preview');

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (53, '/api/communities', 'POST', 209, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (54, '/api/communities/mine', 'GET', 209, 1);

UPDATE app_metadata
SET value = '0032_public_communities', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
