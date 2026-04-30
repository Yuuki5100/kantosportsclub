CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  url TEXT,
  location_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pictures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  url TEXT,
  location_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO movies (id, title, description, url, location_id)
VALUES
  (1, 'サンプル動画 1', 'Hono + D1 疎通確認用の動画データです。', 'https://www.w3schools.com/html/mov_bbb.mp4', '01'),
  (2, 'サンプル動画 2', '一覧表示確認用の動画データです。', 'https://www.w3schools.com/html/movie.mp4', '02');

INSERT OR IGNORE INTO pictures (id, title, description, url, location_id)
VALUES
  (1, 'サンプル画像 1', 'Hono + D1 疎通確認用の画像データです。', 'https://www.w3schools.com/html/pic_trulli.jpg', '01'),
  (2, 'サンプル画像 2', '一覧表示確認用の画像データです。', 'https://www.w3schools.com/html/img_girl.jpg', '02');

UPDATE app_metadata
SET value = '0002_media', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';