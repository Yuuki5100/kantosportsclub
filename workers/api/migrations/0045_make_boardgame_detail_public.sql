-- ボードゲーム詳細は未ログインでも閲覧できるようにする。
UPDATE endpoint_authority_mapping
SET required_level = 0
WHERE url = '/api/boardgames/*'
  AND method = 'GET';

UPDATE app_metadata
SET value = '0045_make_boardgame_detail_public', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
