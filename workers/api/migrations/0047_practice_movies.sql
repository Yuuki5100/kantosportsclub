-- 練習動画一覧
-- communities と同じテーブル構成。
CREATE TABLE IF NOT EXISTS practiceMovies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT CHECK (length(title) <= 1024),
  url TEXT CHECK (length(url) <= 1024),
  note TEXT CHECK (length(note) <= 1024),
  label TEXT CHECK (length(label) <= 1024),
  author TEXT CHECK (length(author) <= 32),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_practiceMovies_title ON practiceMovies(title);
CREATE INDEX IF NOT EXISTS idx_practiceMovies_label ON practiceMovies(label);

UPDATE app_metadata
SET value = '0047_practice_movies', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
