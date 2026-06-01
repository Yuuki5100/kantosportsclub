CREATE TABLE IF NOT EXISTS playerStatus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  review_user_id INTEGER NOT NULL,
  shooting INTEGER,
  dribbling INTEGER,
  passing INTEGER,
  defense INTEGER,
  stamina INTEGER,
  remarks TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY (review_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

INSERT INTO endpoint_authority_mapping
  (url, method, menu_function_id, required_level, created_at, updated_at)
SELECT '/api/player-status', 'GET', 101, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM endpoint_authority_mapping
  WHERE url = '/api/player-status'
    AND method = 'GET'
);

INSERT INTO endpoint_authority_mapping
  (url, method, menu_function_id, required_level, created_at, updated_at)
SELECT '/api/player-status/*', 'GET', 101, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM endpoint_authority_mapping
  WHERE url = '/api/player-status/user/*'
    AND method = 'GET'
);

INSERT INTO endpoint_authority_mapping
  (url, method, menu_function_id, required_level, created_at, updated_at)
SELECT '/api/player-status/user/*/records', 'GET', 101, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM endpoint_authority_mapping
  WHERE url = '/api/player-status/user/*/records'
    AND method = 'GET'
);

INSERT INTO endpoint_authority_mapping
  (url, method, menu_function_id, required_level, created_at, updated_at)
SELECT '/api/player-status', 'POST', 101, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM endpoint_authority_mapping
  WHERE url = '/api/player-status'
    AND method = 'POST'
);

INSERT INTO endpoint_authority_mapping
  (url, method, menu_function_id, required_level, created_at, updated_at)
SELECT '/api/player-status/*', 'PUT', 101, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM endpoint_authority_mapping
  WHERE url = '/api/player-status/*'
    AND method = 'PUT'
);
