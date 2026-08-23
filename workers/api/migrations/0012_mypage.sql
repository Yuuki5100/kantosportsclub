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
  update_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  strengths TEXT
);

-- image_url / user_name_jpn は上の CREATE TABLE で定義済みのため重複 ALTER を削除し、
-- 未定義だった strengths は CREATE TABLE 側に移した。
