CREATE TABLE IF NOT EXISTS contact (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  display TEXT,
  sentence TEXT NOT NULL,
  reporter TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

UPDATE app_metadata
SET value = '0016_contact', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
