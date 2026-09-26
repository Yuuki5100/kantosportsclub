-- 動画詳細とお知らせ詳細は未ログインでも閲覧できるようにする。
UPDATE endpoint_authority_mapping
SET required_level = 0
WHERE (url = '/api/movies/*' AND method = 'GET')
   OR (url = '/api/notice/notice_id' AND method = 'GET');

UPDATE app_metadata
SET value = '0046_make_movie_notice_detail_public', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
