-- コンテンツの一覧取得は未ログインでも許可する。
-- 詳細取得・登録・更新・削除の権限は変更しない。

UPDATE endpoint_authority_mapping
SET required_level = 0
WHERE method = 'GET'
  AND url IN ('/api/boardgames', '/api/movies', '/api/pictures');

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (50, '/api/boardgames/search', 'GET', 203, 0);
