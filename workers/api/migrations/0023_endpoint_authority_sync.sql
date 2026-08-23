-- endpoint_authority_mapping を本番 DB の内容に合わせて再構築する。
-- migrations との差分は以下のとおりだった。
--   * 本番は /api/pictures（複数形）だが migrations は /api/picture（単数形）
--   * /api/mypage/*/hope-style PUT が未登録
--   * /api/player-status, /api/player-status/* PUT が未登録
--   * /api/practice-menu/headers の POST / PUT の required_level が
--     本番 1 に対し migrations は 2
-- 差分パッチだと本番側の削除済みレコードを再現できないため、全件洗い替えする。

DELETE FROM endpoint_authority_mapping;

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (1, '/api/example1', 'GET', 101, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (2, '/api/example2', 'POST', 102, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (3, '/api/example3', 'DELETE', 103, 3);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (4, '/api/health', 'GET', 101, 0);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (5, '/api/auth/*', 'GET', 101, 0);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (6, '/api/auth/*', 'POST', 101, 0);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (7, '/api/notices/current', 'GET', 101, 0);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (10, '/api/pictures', 'GET', 201, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (11, '/api/pictures', 'POST', 201, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (12, '/api/pictures/*', 'GET', 201, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (13, '/api/pictures/*', 'PUT', 201, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (14, '/api/pictures/*', 'DELETE', 201, 3);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (20, '/api/movies', 'GET', 202, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (21, '/api/movies', 'POST', 202, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (22, '/api/movies/*', 'GET', 202, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (23, '/api/movies/*', 'PUT', 202, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (24, '/api/movies/*', 'DELETE', 202, 3);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (30, '/api/boardgames', 'GET', 203, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (31, '/api/boardgames', 'POST', 203, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (32, '/api/boardgames/*', 'GET', 203, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (33, '/api/boardgames/*', 'PUT', 203, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (34, '/api/boardgames/*', 'DELETE', 203, 3);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (35, '/api/notices/current', 'GET', 204, 0);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (39, '/api/notice/notice_id', 'GET', 204, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (40, '/api/notice/create', 'POST', 204, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (41, '/api/notice/notice_id', 'PUT', 204, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (42, '/api/mypage/*', 'GET', 205, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (43, '/api/mypage/*', 'PUT', 205, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (44, '/api/mypage/list', 'GET', 205, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (45, '/api/files/upload', 'POST', 206, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (47, '/api/contacts', 'GET', 207, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (48, '/api/contacts', 'POST', 207, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (49, '/api/contacts/*', 'GET', 207, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (50, '/api/contacts/*', 'PUT', 207, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (51, '/api/practice-menu/headers', 'GET', 208, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (52, '/api/practice-menu/headers', 'POST', 208, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (53, '/api/practice-menu/headers', 'PUT', 208, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (54, '/api/practice-menu/headers/*', 'GET', 208, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (55, '/api/practice-menu/headers/*', 'PUT', 208, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (56, '/api/master_locations', 'GET', 30044, 0);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (57, '/api/player-status', 'GET', 101, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (58, '/api/player-status', 'POST', 101, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (59, '/api/player-status/*', 'PUT', 101, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (60, '/api/player-status/user/*', 'GET', 101, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (61, '/api/player-status/user/*/records', 'GET', 101, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (62, '/api/player-status/user/*', 'POST', 101, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (63, '/api/player-status/user/*', 'PUT', 101, 2);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (64, '/api/mypage/*/hope-style', 'PUT', 205, 3);
