INSERT INTO users (username, password, email, role)
SELECT 'hyuya', 'password', 'hyuya@example.com', 'USER'
WHERE NOT EXISTS (
  SELECT 1
  FROM users
  WHERE username = 'hyuya'
);

DELETE FROM user_role_permissions
WHERE user_id IN (
  SELECT id
  FROM users
  WHERE username = 'hyuya'
);

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '101', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '102', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '103', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '201', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '202', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '203', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '204', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '205', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '206', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '207', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT id, '208', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM users WHERE username = 'hyuya';

INSERT INTO mypage (
  user_id,
  user_name,
  user_name_jpn,
  jersey_number,
  enthusiasm,
  hope_style,
  remarks,
  image_url,
  create_at,
  update_at,
  strengths
)
SELECT
  17,
  'hyuya',
  NULL,
  NULL,
  'がんばります',
  'F / G',
  'テストですｗ',
  'mypage/noiamge.jpeg',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'シュート打てます'
WHERE NOT EXISTS (
  SELECT 1
  FROM mypage
  WHERE user_id = 17
);
