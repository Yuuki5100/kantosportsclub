-- 作成したコミュニティは、ログイン済みユーザーであれば参照可能にする。
-- 未ログインの場合は API route 側で 401 を返す。
UPDATE endpoint_authority_mapping
SET required_level = 0
WHERE method = 'GET'
  AND url = '/api/communities/mine';

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (54, '/api/communities/mine', 'GET', 209, 0);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (55, '/api/communities/*', 'GET', 209, 1),
  (56, '/api/communities/*', 'PUT', 209, 2);

UPDATE app_metadata
SET value = '0033_communities_mine_access', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
