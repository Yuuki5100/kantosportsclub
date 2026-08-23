CREATE TABLE IF NOT EXISTS master_locations (
  location_id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_name TEXT,
  location_outinside TEXT,
  location_division TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  image_url1 TEXT,
  image_url2 TEXT
);

INSERT OR IGNORE INTO master_locations (
  location_id,
  location_name,
  location_outinside,
  location_division
)
VALUES
  (1, '神奈川県立スポーツ会館', '室内', 'バスケ'),
  (2, '88コード', '屋外', 'バスケ＆ボドゲ'),
  (3, 'カルッツ川崎', '室内', 'バスケ＆ボドゲ'),
  (4, 'ビナレッジ', '室内', 'バスケ＆ボドゲ'),
  (5, '中山バッティングセンター', '室内', 'バスケ'),
  (6, '横浜市中川西地区センター', '室内', 'バスケ'),
  (7, '仲町台地区センター', '室内', 'バスケ'),  
  (8, '横浜市中スポーツセンター', '室内', 'バスケ'),
  (9, '神奈川近代文学館', '室内', 'ボドゲ'),
  (10, '横浜市東山田スポーツ会館', '室内', 'バスケ'),
  (11, '横浜市北山田地区センター', '室内', 'バスケ'),
  (12, 'ラウンドワン 高津店', '室内', 'ボーリング'),
  (13, 'てくのかわさき', '室内', 'ボドゲ'),
  (14, 'ロッツ横浜', '室内', 'バスケ');

-- image_url1 / image_url2 は上の CREATE TABLE で定義済みのため、
-- 重複していた ALTER TABLE ADD COLUMN を削除した。
UPDATE master_locations SET image_url1 = 'location_img/神奈川県立スポーツ会館.jpg', image_url2 = 'location_img/神奈川県立スポーツ会館2.jpg' WHERE location_id = 1;
UPDATE master_locations SET image_url1 = 'location_img/88コート.jpg', image_url2 = 'location_img/88コート2.jpg' WHERE location_id = 2;
UPDATE master_locations SET image_url1 = 'location_img/横浜市東山田スポーツ会館.jpg', image_url2 = 'location_img/横浜市東山田スポーツ会館2.jpg' WHERE location_id = 10;
UPDATE master_locations SET image_url1 = 'location_img/横浜市北山田地区会館.jpg', image_url2 = 'location_img/横浜市北山田地区会館2.jpg' WHERE location_id = 11;
