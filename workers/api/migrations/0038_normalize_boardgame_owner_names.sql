-- ボードゲーム所有者名をログインユーザー名へ統一する。
UPDATE boardgames SET owner_name = 'gotou' WHERE owner_name = '後藤';
UPDATE boardgames SET owner_name = 'koizumi' WHERE owner_name = '小泉';
UPDATE boardgames SET owner_name = 'orita' WHERE owner_name = '織田';
UPDATE boardgames SET owner_name = 'wada' WHERE owner_name = '和田';

UPDATE app_metadata
SET value = '0038_normalize_boardgame_owner_names', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
