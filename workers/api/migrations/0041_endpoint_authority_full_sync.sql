-- Route 定義を正本として endpoint_authority_mapping を再構築する。
-- 旧 migration では mapping id の再利用により endpoint が上書きされていたため、
-- route に存在する endpoint を重複しない ID で登録する。

DELETE FROM endpoint_authority_mapping;

INSERT INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (1, '/api/health', 'GET', 101, 0),
  (2, '/api/auth/*', 'GET', 101, 0),
  (3, '/api/auth/*', 'POST', 101, 0),
  (4, '/api/notices/current', 'GET', 101, 0),
  (10, '/api/pictures', 'GET', 201, 0),
  (11, '/api/pictures', 'POST', 201, 2),
  (12, '/api/pictures/*', 'GET', 201, 1),
  (13, '/api/pictures/*', 'PUT', 201, 2),
  (20, '/api/movies', 'GET', 202, 0),
  (21, '/api/movies', 'POST', 202, 2),
  (22, '/api/movies/*', 'GET', 202, 1),
  (23, '/api/movies/*', 'PUT', 202, 2),
  (30, '/api/boardgames', 'GET', 203, 0),
  (31, '/api/boardgames', 'POST', 203, 2),
  (32, '/api/boardgames/search', 'GET', 203, 0),
  (33, '/api/boardgames/*', 'GET', 203, 1),
  (34, '/api/boardgames/*', 'PUT', 203, 2),
  (35, '/api/boardgames/*', 'DELETE', 203, 3),
  (40, '/api/notice/notice_id', 'GET', 204, 1),
  (41, '/api/notice/create', 'POST', 204, 2),
  (42, '/api/notice/notice_id', 'PUT', 204, 1),
  (50, '/api/mypage/list', 'GET', 205, 1),
  (51, '/api/mypage/*', 'GET', 205, 1),
  (52, '/api/mypage/*', 'PUT', 205, 1),
  (60, '/api/files/upload', 'POST', 206, 1),
  (61, '/api/contacts', 'GET', 207, 1),
  (62, '/api/contacts', 'POST', 207, 1),
  (63, '/api/contacts/*', 'GET', 207, 1),
  (64, '/api/contacts/*', 'PUT', 207, 1),
  (70, '/api/practice-menu/headers', 'GET', 208, 0),
  (71, '/api/practice-menu/headers', 'POST', 208, 1),
  (72, '/api/practice-menu/headers', 'PUT', 208, 1),
  (73, '/api/practice-menu/headers/*', 'GET', 208, 1),
  (74, '/api/practice-menu/headers/*', 'PUT', 208, 1),
  (80, '/api/master_locations', 'GET', 30044, 0),
  (90, '/api/player-status', 'GET', 101, 1),
  (91, '/api/player-status', 'POST', 101, 2),
  (92, '/api/player-status/*', 'GET', 101, 1),
  (93, '/api/player-status/*', 'PUT', 101, 2),
  (94, '/api/player-status/user/*', 'GET', 101, 1),
  (95, '/api/player-status/user/*/records', 'GET', 101, 1),
  (100, '/api/communities', 'GET', 209, 0),
  (101, '/api/communities', 'POST', 209, 2),
  (102, '/api/communities/preview', 'GET', 209, 0),
  (103, '/api/communities/mine', 'GET', 209, 0),
  (104, '/api/communities/*', 'GET', 209, 1),
  (105, '/api/communities/*', 'PUT', 209, 2),
  (106, '/api/communities/*', 'DELETE', 209, 2);

UPDATE app_metadata
SET value = '0041_endpoint_authority_full_sync', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';

