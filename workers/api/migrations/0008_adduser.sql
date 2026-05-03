DELETE FROM user_role_permissions
WHERE user_id IN (
  SELECT id FROM users
  WHERE username IN (
    'gotou', 'taichi', 'wada', 'takamura',
    'abe', 'koizumi', 'kawahara', 'takafumi', 'keita'
  )
);

-- Consolidated auth corrections from 0008_auth_login_public_and_seed_password.sql.
-- Keep the later migration as the source of truth for public auth endpoints and
-- the intended seeded password hash.
INSERT INTO endpoint_authority_mapping
  (url, method, menu_function_id, required_level, created_at, updated_at)
SELECT '/api/auth/*', 'GET', 101, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM endpoint_authority_mapping
  WHERE url = '/api/auth/*'
    AND method = 'GET'
);

INSERT INTO endpoint_authority_mapping
  (url, method, menu_function_id, required_level, created_at, updated_at)
SELECT '/api/auth/*', 'POST', 101, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM endpoint_authority_mapping
  WHERE url = '/api/auth/*'
    AND method = 'POST'
);

UPDATE users
SET password = '$2b$12$NipHmH6Z.Ml1RInl1FEyeeFgZhHCpbHQuxvLqxew3rTJywzS9QHm.'
WHERE username IN ('admin', 'user', 'viewer');

DROP TABLE IF EXISTS tmp_resources;

CREATE TABLE tmp_resources (
  resource TEXT NOT NULL
);

INSERT INTO tmp_resources (resource) VALUES ('101');
INSERT INTO tmp_resources (resource) VALUES ('102');
INSERT INTO tmp_resources (resource) VALUES ('103');
INSERT INTO tmp_resources (resource) VALUES ('201');
INSERT INTO tmp_resources (resource) VALUES ('202');
INSERT INTO tmp_resources (resource) VALUES ('203');
INSERT INTO tmp_resources (resource) VALUES ('204');

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT
  u.id,
  r.resource,
  CASE u.username
    WHEN 'gotou' THEN 3
    WHEN 'taichi' THEN 2
    WHEN 'wada' THEN 2
    WHEN 'takamura' THEN 2
    WHEN 'abe' THEN 1
    WHEN 'koizumi' THEN 1
    WHEN 'kawahara' THEN 1
    WHEN 'takafumi' THEN 1
    WHEN 'keita' THEN 1
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
CROSS JOIN tmp_resources r
WHERE u.username IN (
  'gotou', 'taichi', 'wada', 'takamura',
  'abe', 'koizumi', 'kawahara', 'takafumi', 'keita'
);

DROP TABLE IF EXISTS tmp_resources;
