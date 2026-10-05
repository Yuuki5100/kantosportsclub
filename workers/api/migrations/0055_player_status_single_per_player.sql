-- playerStatus は評価者別ではなく、選手ごとの最新ステータスを正本として扱う。
-- 既存の review_user_id 列は過去データとの互換性のため残すが、API では参照・更新条件に使わない。
DELETE FROM playerStatus
WHERE id NOT IN (
  SELECT id
  FROM playerStatus latest
  WHERE NOT EXISTS (
    SELECT 1
    FROM playerStatus newer
    WHERE newer.user_id = latest.user_id
      AND (newer.updated_at > latest.updated_at
        OR (newer.updated_at = latest.updated_at AND newer.id > latest.id))
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_player_status_user_id
  ON playerStatus (user_id);
