-- 0042_restore_backup_data.sql で復元された表示名をユーザー名へ戻す。
UPDATE boardgames SET owner_name = 'gotou' WHERE owner_name = '後藤';
UPDATE boardgames SET owner_name = 'koizumi' WHERE owner_name = '小泉';
UPDATE boardgames SET owner_name = 'orita' WHERE owner_name = '織田';
UPDATE boardgames SET owner_name = 'wada' WHERE owner_name = '和田';

UPDATE app_metadata
SET value = '0044_restore_boardgame_owner_names', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
