-- hyuya がマイページの選手ステータスを更新できるよう、本人評価の初期行を作成する。
-- PUT /api/player-status/user/:user_id は対象選手と評価者の既存行を更新するため、
-- 初期行が無いと hyuya 自身の更新が 404 になる。
INSERT INTO playerStatus (
  user_id,
  review_user_id,
  shooting,
  dribbling,
  passing,
  defense,
  stamina,
  remarks
)
SELECT
  u.id,
  u.id,
  6,
  7,
  8,
  5,
  9,
  NULL
FROM users u
WHERE u.username = 'hyuya'
  AND NOT EXISTS (
    SELECT 1
    FROM playerStatus ps
    WHERE ps.user_id = u.id
      AND ps.review_user_id = u.id
  );
