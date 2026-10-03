-- level 1 ユーザーを通常ユーザー（level 2）へ昇格する。
-- 認証時の実効 roleLevel は users.role から算出されるため、
-- role_level だけでなく role も USER に更新する。
UPDATE users
SET role = 'USER',
    role_level = 2
WHERE role_level = 1;

UPDATE app_metadata
SET value = '0054_promote_level_one_users',
    updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
