-- コミュニティ（リンク）一覧
-- D1/SQLite では DATE を ISO 8601 形式の TEXT として保存する。
CREATE TABLE IF NOT EXISTS communities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT CHECK (length(title) <= 1024),
  url TEXT CHECK (length(url) <= 1024),
  note TEXT CHECK (length(note) <= 1024),
  label TEXT CHECK (length(label) <= 1024),
  author TEXT CHECK (length(author) <= 32),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_communities_title ON communities(title);
CREATE INDEX IF NOT EXISTS idx_communities_label ON communities(label);

INSERT OR REPLACE INTO master_menu_function (id, name)
VALUES (209, 'コミュニティ');

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (51, '/api/communities', 'GET', 209, 1);

INSERT OR REPLACE INTO endpoint_authority_mapping
  (id, url, method, menu_function_id, required_level)
VALUES
  (52, '/api/communities/preview', 'GET', 209, 1);

UPDATE app_metadata
SET value = '0031_communities', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
