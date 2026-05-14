CREATE TABLE IF NOT EXISTS mypage (
  user_id INTEGER PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_name_jpn TEXT,
  jersey_number INTEGER,
  enthusiasm TEXT,
  hope_style TEXT,
  remarks TEXT,
  image_url TEXT,
  create_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE mypage ADD COLUMN image_url TEXT;
ALTER TABLE mypage ADD COLUMN user_name_jpn TEXT;
