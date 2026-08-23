-- 本番 DB にのみ存在していた実ユーザー（gotou / taichi / wada / takamura /
-- abe / koizumi / kawahara / takafumi / keita）を登録する。
-- あわせて user_role_permissions を本番の内容に合わせる。
--
-- user_role_permissions は 0008_adduser.sql が上記ユーザー分を DELETE している一方、
-- 後から流れる 0009_user_role_permisson.sql が user_id 4〜16 をハードコードで再投入して
-- しまっており、本番（user 1,2,3,17 の 35 行のみ）と食い違っていた。
-- 実際に稼働している本番の状態を正としてこちらへ寄せる。
--
-- 既存レコードがある場合も同じ結果になるよう、INSERT は username 存在チェック付き、
-- 属性は UPDATE で上書きする冪等な書き方にしている。

INSERT INTO users (id, username, password, email, role, role_level)
SELECT 4, 'gotou', 'pbkdf2-sha256$10000$b75199f02ddb998713674c6c394d106c$0c997ced42c1d35e46a81295a7ee227c78d5ebeed07c8bb8539715262871ced5', 'gotou@example.com', 'ADMIN', 1
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'gotou'
);

UPDATE users
SET password = 'pbkdf2-sha256$10000$b75199f02ddb998713674c6c394d106c$0c997ced42c1d35e46a81295a7ee227c78d5ebeed07c8bb8539715262871ced5',
    email = 'gotou@example.com',
    role = 'ADMIN',
    role_level = 1
WHERE username = 'gotou';

INSERT INTO users (id, username, password, email, role, role_level)
SELECT 5, 'taichi', 'pbkdf2-sha256$10000$7f70efce1a65190471199f9d270c1fc3$a4f1050041a38f5718bd34e04781acb8fd9809dcd562797c9cf8a04a927ca2ae', 'taichi@example.com', 'admin', 3
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'taichi'
);

UPDATE users
SET password = 'pbkdf2-sha256$10000$7f70efce1a65190471199f9d270c1fc3$a4f1050041a38f5718bd34e04781acb8fd9809dcd562797c9cf8a04a927ca2ae',
    email = 'taichi@example.com',
    role = 'admin',
    role_level = 3
WHERE username = 'taichi';

INSERT INTO users (id, username, password, email, role, role_level)
SELECT 6, 'wada', 'pbkdf2-sha256$10000$5f390deedb4d72353bb06a547181bd39$2ef28e3fba64ea9e7ef029938e808ea3bd6e8b23172e58f328d9a88a9ca4b90a', 'wada@example.com', 'ADMIN', 3
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'wada'
);

UPDATE users
SET password = 'pbkdf2-sha256$10000$5f390deedb4d72353bb06a547181bd39$2ef28e3fba64ea9e7ef029938e808ea3bd6e8b23172e58f328d9a88a9ca4b90a',
    email = 'wada@example.com',
    role = 'ADMIN',
    role_level = 3
WHERE username = 'wada';

INSERT INTO users (id, username, password, email, role, role_level)
SELECT 7, 'takamura', 'pbkdf2-sha256$10000$5bf51ce6ff1758a9dc2f56441df23ff3$ee1ead350cfff2048f9e2ec16ba8381d6329e60e09c9e8c07cc8add79f99a953', 'takamura@example.com', 'USER', 1
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'takamura'
);

UPDATE users
SET password = 'pbkdf2-sha256$10000$5bf51ce6ff1758a9dc2f56441df23ff3$ee1ead350cfff2048f9e2ec16ba8381d6329e60e09c9e8c07cc8add79f99a953',
    email = 'takamura@example.com',
    role = 'USER',
    role_level = 1
WHERE username = 'takamura';

INSERT INTO users (id, username, password, email, role, role_level)
SELECT 8, 'abe', 'pbkdf2-sha256$10000$a8c406b1606cc1d1cbc8a186f0b81fa6$0ddce84a656cb254a638966334e274768ba5551f1f2ea5cf489f847cf5d9707e', 'abe@example.com', 'VIEWER', 1
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'abe'
);

UPDATE users
SET password = 'pbkdf2-sha256$10000$a8c406b1606cc1d1cbc8a186f0b81fa6$0ddce84a656cb254a638966334e274768ba5551f1f2ea5cf489f847cf5d9707e',
    email = 'abe@example.com',
    role = 'VIEWER',
    role_level = 1
WHERE username = 'abe';

INSERT INTO users (id, username, password, email, role, role_level)
SELECT 9, 'koizumi', 'pbkdf2-sha256$10000$39815ec8f23a6d744e7b7508545de584$79a08363b1723c7d6c85be054c2ca7860d12c438e11ec57c64093b59b9570299', 'koizumi@example.com', 'VIEWER', 1
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'koizumi'
);

UPDATE users
SET password = 'pbkdf2-sha256$10000$39815ec8f23a6d744e7b7508545de584$79a08363b1723c7d6c85be054c2ca7860d12c438e11ec57c64093b59b9570299',
    email = 'koizumi@example.com',
    role = 'VIEWER',
    role_level = 1
WHERE username = 'koizumi';

INSERT INTO users (id, username, password, email, role, role_level)
SELECT 10, 'kawahara', 'pbkdf2-sha256$10000$3364958bf02ca2cba4a5f9bebe96258f$6a656f03d000b2e37a3891bc64038b145ba6a20c6508cf58a78af8cc399bb467', 'kawahara@example.com', 'VIEWER', 1
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'kawahara'
);

UPDATE users
SET password = 'pbkdf2-sha256$10000$3364958bf02ca2cba4a5f9bebe96258f$6a656f03d000b2e37a3891bc64038b145ba6a20c6508cf58a78af8cc399bb467',
    email = 'kawahara@example.com',
    role = 'VIEWER',
    role_level = 1
WHERE username = 'kawahara';

INSERT INTO users (id, username, password, email, role, role_level)
SELECT 11, 'takafumi', 'pbkdf2-sha256$10000$3364958bf02ca2cba4a5f9bebe96258f$6a656f03d000b2e37a3891bc64038b145ba6a20c6508cf58a78af8cc399bb467', 'takafumi@example.com', 'VIEWER', 1
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'takafumi'
);

UPDATE users
SET password = 'pbkdf2-sha256$10000$3364958bf02ca2cba4a5f9bebe96258f$6a656f03d000b2e37a3891bc64038b145ba6a20c6508cf58a78af8cc399bb467',
    email = 'takafumi@example.com',
    role = 'VIEWER',
    role_level = 1
WHERE username = 'takafumi';

INSERT INTO users (id, username, password, email, role, role_level)
SELECT 12, 'keita', 'pbkdf2-sha256$10000$3364958bf02ca2cba4a5f9bebe96258f$6a656f03d000b2e37a3891bc64038b145ba6a20c6508cf58a78af8cc399bb467', 'keita@example.com', 'VIEWER', 1
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'keita'
);

UPDATE users
SET password = 'pbkdf2-sha256$10000$3364958bf02ca2cba4a5f9bebe96258f$6a656f03d000b2e37a3891bc64038b145ba6a20c6508cf58a78af8cc399bb467',
    email = 'keita@example.com',
    role = 'VIEWER',
    role_level = 1
WHERE username = 'keita';

-- hyuya のパスワードハッシュを本番の値に合わせる
-- （0020_add_hyuya_player_data.sql が別ソルトのハッシュを設定していた）
UPDATE users
SET password = 'pbkdf2-sha256$10000$1ff2cbb110ccc645a068285e885d20ab$f9f77d02b0098d27656ef68210ec337b96e09450c58389f3288e4fc5825f12bc'
WHERE username = 'hyuya';

-- user_role_permissions を本番と同じ内容に洗い替えする
DELETE FROM user_role_permissions;

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 1, id, '101', 3 FROM users WHERE username = 'admin';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 2, id, '102', 3 FROM users WHERE username = 'admin';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 3, id, '103', 3 FROM users WHERE username = 'admin';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 4, id, '201', 3 FROM users WHERE username = 'admin';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 5, id, '202', 3 FROM users WHERE username = 'admin';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 6, id, '203', 3 FROM users WHERE username = 'admin';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 7, id, '204', 3 FROM users WHERE username = 'admin';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 8, id, '206', 1 FROM users WHERE username = 'admin';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 9, id, '207', 3 FROM users WHERE username = 'admin';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 10, id, '101', 1 FROM users WHERE username = 'user';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 11, id, '102', 2 FROM users WHERE username = 'user';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 12, id, '201', 2 FROM users WHERE username = 'user';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 13, id, '202', 2 FROM users WHERE username = 'user';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 14, id, '203', 2 FROM users WHERE username = 'user';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 15, id, '204', 2 FROM users WHERE username = 'user';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 16, id, '206', 1 FROM users WHERE username = 'user';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 17, id, '207', 2 FROM users WHERE username = 'user';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 20, id, '102', 1 FROM users WHERE username = 'viewer';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 21, id, '201', 1 FROM users WHERE username = 'viewer';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 22, id, '202', 1 FROM users WHERE username = 'viewer';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 23, id, '203', 1 FROM users WHERE username = 'viewer';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 24, id, '204', 1 FROM users WHERE username = 'viewer';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 25, id, '206', 1 FROM users WHERE username = 'viewer';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 26, id, '207', 1 FROM users WHERE username = 'viewer';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 27, id, '101', 2 FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 28, id, '102', 2 FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 29, id, '103', 2 FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 30, id, '201', 2 FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 31, id, '202', 2 FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 32, id, '203', 2 FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 33, id, '204', 2 FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 34, id, '205', 2 FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 35, id, '206', 2 FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 36, id, '207', 2 FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions (id, user_id, resource, permission_level)
SELECT 37, id, '208', 2 FROM users WHERE username = 'hyuya';

