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

-- ---------------------------------------------------------------------------
-- Additional test users
-- ---------------------------------------------------------------------------
INSERT INTO users (id, username, password, email, role)
SELECT 13, 'narita', 'pbkdf2-sha256$10000$1ff2cbb110ccc645a068285e885d20ab$f9f77d02b0098d27656ef68210ec337b96e09450c58389f3288e4fc5825f12bc', 'narita@example.com', 'USER'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'narita'
);

INSERT INTO users (id, username, password, email, role)
SELECT 14, 'oosawa', 'pbkdf2-sha256$10000$a4960d1d636808e6fdd7b5c463d26d31$0d278a36d8b862396a8f1b202416cab4bbfa76d0e4a8e70b802438d44c7e1fd0', 'oosawa@example.com', 'USER'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'oosawa'
);

INSERT INTO users (id, username, password, email, role)
SELECT 15, 'araki', 'pbkdf2-sha256$10000$efb7b736a970525edf6f706605f19ffe$b687037423ce76ca925ad88bfbe12c917bd18be629562ba0ac3134df11b24bcd', 'araki@example.com', 'USER'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'araki'
);

INSERT INTO users (id, username, password, email, role)
SELECT 16, 'orita', 'pbkdf2-sha256$10000$1ff2cbb110ccc645a068285e885d20ab$f9f77d02b0098d27656ef68210ec337b96e09450c58389f3288e4fc5825f12bc', 'orita@example.com', 'USER'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'orita'
);

DELETE FROM user_role_permissions
WHERE user_id IN (
  SELECT id FROM users
  WHERE username IN ('narita', 'oosawa', 'araki', 'orita')
);

INSERT INTO user_role_permissions
  (user_id, resource, permission_level, created_at, updated_at)
SELECT
  u.id,
  r.resource,
  CASE u.username
    WHEN 'narita' THEN 1
    WHEN 'oosawa' THEN 1
    WHEN 'araki' THEN 1
    WHEN 'orita' THEN 1
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
CROSS JOIN tmp_resources r
WHERE u.username IN ('narita', 'oosawa', 'araki', 'orita')
  AND r.resource IN ('101', '201', '204');

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
