CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  station TEXT,
  location_id INTEGER,
  people INTEGER,
  people_name TEXT,
  remarks TEXT,
  public_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO notices (
  title,
  station,
  location_id,
  people,
  people_name,
  public_at,
  closed_at
)
VALUES
  ('バスケ', '横浜', 01, 5, '和田、高村、後藤、小泉、阿部', '2026-04-30 10:00:00', '2026-05-30 20:00:00');