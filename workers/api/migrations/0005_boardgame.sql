CREATE TABLE IF NOT EXISTS boardgames (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  boardgame_name TEXT,
  owner_name TEXT,
  people_min INTEGER,
  people_max INTEGER,
  need_time INTEGER,
  url_str TEXT,
  how_to_play TEXT,
  remarks TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  image_url1 TEXT,
  image_url2 TEXT
);

INSERT OR IGNORE INTO boardgames (
  boardgame_name,
  owner_name,
  people_min,
  people_max,
  need_time,
  url_str,
  how_to_play,
  remarks
)
VALUES
  ('ピラノドミノ','後藤',2,4,45,'http://info.kenbill.com/?p=3587','同じ色同士ピラミッドを組み立てるゲーム', ''),
  ('斯くして我は独裁者に成れり','後藤',4,12,30,'https://ahcahc.com/creative-ahc/kushiteha/','なんか役職でバトルするやつ', ''),
  ('ことば落とし','後藤',2,8,5,'https://jelly2games.com/worddrop','指定されたワードを3分以内にトークで言うゲーム', ''),
  ('はぁっていうゲーム','後藤',2,6,3,'https://www.gentosha.co.jp/s/haa-game/','お題の単語を喋って、それがどの場面なのかを当てるゲーム', ''),
  ('人狼','後藤',4,14,50,'','人狼をやっつけるゲーム', ''),
  ('宝探しいっぱい！','後藤',2,6,5,'https://arclightgames.jp/product/576houseki/','裏向きのカードを表にして点数を競うゲーム', ''),
  ('ミツカルタ','後藤',2,6,10,'https://jelly2games.com/mitsukaruta','素早くひらがなをつなげて点数を稼ぐゲーム', ''),
  ('コヨーテ','小泉',2,10,30,'https://shop.jellyjellycafe.com/products/detail/27','場の数字の合計を「コヨーテ」と言っておおまかに当てるゲーム', ''),
  ('カタン','和田',2,4,90,'https://www.gp-inc.jp/boardgame_catan.html','陣地を広げていって合計点数を競うゲーム', ''),
  ('午前1時の大脱走','不明',2,5,20,'https://saashiandsaashi.com/ja/products/1_am_jailbreak','大富豪のアレンジ版みたいなやつで、手札0枚になったら勝利', ''),
  ('ito レインボー','不明',2,14,15,'https://arclightgames.jp/product/705rainbow/','お題に対して自身が持っている数値がどの程度なのか価値観を擦り合わせて数字を並べるゲーム', ''),
  ('インサイダーゲーム','不明',4,8,15,'https://oinkgames.com/ja/games/analog/insider/','ワード人狼', ''),
  ('スプレンダー','不明',2,4,30,'https://hobbyjapan.games/splendor/','ラウンドの終了時に最も威信ポイントの高いプレイヤーが勝者', ''),
  ('まっぷたツートンソウル2！','不明',3,8,30,'https://yofukashiproject.com/mapputa/','前世の職業が一緒の相方を探すゲーム', '');

ALTER TABLE boardgames ADD COLUMN image_url1 TEXT; ALTER TABLE boardgames ADD COLUMN image_url2 TEXT;
UPDATE boardgames SET   image_url1 = 'boardgames_img/ito.jpg',   image_url2 = 'boardgames_img/ito2.jpg' WHERE id = 11;