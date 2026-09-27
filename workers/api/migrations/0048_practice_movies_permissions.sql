-- practicemovies API の権限設定。
-- communities API と同じ権限レベルで、一覧・プレビュー・自分の投稿は公開する。
INSERT OR REPLACE INTO master_menu_function (id, name)
VALUES (210, '練習動画');

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (107, '/api/practicemovies', 'GET', 210, 0),
  (108, '/api/practicemovies', 'POST', 210, 2),
  (109, '/api/practicemovies/preview', 'GET', 210, 0),
  (110, '/api/practicemovies/mine', 'GET', 210, 0),
  (111, '/api/practicemovies/*', 'GET', 210, 1),
  (112, '/api/practicemovies/*', 'PUT', 210, 2),
  (113, '/api/practicemovies/*', 'DELETE', 210, 2);

UPDATE app_metadata
SET value = '0048_practice_movies_permissions', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
