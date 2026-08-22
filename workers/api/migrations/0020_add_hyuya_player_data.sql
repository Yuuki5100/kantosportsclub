-- hyuya を選手一覧 / 選手詳細（player-list.tsx / player-detail.tsx）に表示するためのデータ登録。
--
-- 選手一覧・選手詳細は mypage テーブルを参照している（GET /api/mypage/list, GET /api/mypage/:userId）ため、
-- users だけでなく mypage にレコードが無いと画面に出てこない。
--
-- 0019_add_hyuya.sql の以下の問題を補完する。
--   1. mypage の user_id を 17 でハードコードしていたため、hyuya の実際の users.id と
--      ズレた場合（あるいは user_id=17 が別レコードで埋まっていた場合）に INSERT がスキップされる。
--      → username から users.id を解決する方式に変更。
--   2. password が平文 'password' のままで、verifyPasswordHash が PBKDF2 形式以外を
--      常に false 判定するためログインできない。
--      → 他のシードユーザーと同じ PBKDF2 ハッシュ（平文は "password"）に統一。
--
-- 何度実行しても同じ結果になるよう、すべて冪等に書いている。

-- 1) users: 未登録なら作成する
INSERT INTO users (username, password, email, role, role_level)
SELECT
  'hyuya',
  'pbkdf2-sha256$10000$3f347321712739e8bc0b05746409243f$38b5c7fde0c1cf72176cd979058b1270fef61c4727359492dffbca853ec6f629',
  'hyuya@example.com',
  'USER',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'hyuya'
);

-- 2) users: 平文パスワードで登録されていた場合は PBKDF2 形式に置き換える
UPDATE users
SET password = 'pbkdf2-sha256$10000$3f347321712739e8bc0b05746409243f$38b5c7fde0c1cf72176cd979058b1270fef61c4727359492dffbca853ec6f629'
WHERE username = 'hyuya'
  AND password NOT LIKE 'pbkdf2-sha256$%';

-- 3) user_role_permissions: 不足しているリソースのみ追加する
INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT
  u.id,
  r.resource,
  2,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
CROSS JOIN (
  SELECT '101' AS resource
  UNION ALL SELECT '102'
  UNION ALL SELECT '103'
  UNION ALL SELECT '201'
  UNION ALL SELECT '202'
  UNION ALL SELECT '203'
  UNION ALL SELECT '204'
  UNION ALL SELECT '205'
  UNION ALL SELECT '206'
  UNION ALL SELECT '207'
  UNION ALL SELECT '208'
) r
WHERE u.username = 'hyuya'
  AND NOT EXISTS (
    SELECT 1
    FROM user_role_permissions p
    WHERE p.user_id = u.id
      AND p.resource = r.resource
  );

-- 4) mypage: 選手一覧 / 選手詳細の表示元。未登録なら作成する
INSERT INTO mypage (
  user_id,
  user_name,
  user_name_jpn,
  jersey_number,
  enthusiasm,
  hope_style,
  remarks,
  image_url,
  strengths,
  create_at,
  update_at
)
SELECT
  u.id,
  'hyuya',
  NULL,
  NULL,
  'がんばります',
  'F / G',
  'テストですｗ',
  'mypage/noiamge.jpeg',
  'シュート打てます',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
WHERE u.username = 'hyuya'
  AND NOT EXISTS (
    SELECT 1 FROM mypage m WHERE m.user_id = u.id
  );
