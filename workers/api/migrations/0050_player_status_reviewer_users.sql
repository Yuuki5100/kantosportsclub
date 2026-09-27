-- 選手ステータスの評価者を admin (user_id 1) と taichi (user_id 5) に限定する。
-- taichi の既存評価は維持し、それ以外の評価者を admin に統一する。
UPDATE playerStatus
SET review_user_id = CASE
  WHEN review_user_id = 5 THEN 5
  ELSE 1
END,
updated_at = CURRENT_TIMESTAMP;

UPDATE app_metadata
SET value = '0050_player_status_reviewer_users',
    updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
