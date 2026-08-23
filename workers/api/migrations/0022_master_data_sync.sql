-- 本番 DB のマスタデータのうち migrations に反映されていなかった分を同期する。
--   * master_locations: id=15「江戸川区文化スポーツプラザ」が未登録だった
--   * boardgames      : id=15「シキスラ メメントオンライン」が未登録、
--                       および id=1〜14 の owner_name / how_to_play / 画像URL が
--                       本番で更新済みだったため全件を本番値に合わせる
-- created_at / updated_at は既定値（適用時刻）のままとし、内容のみを同期する。

INSERT OR REPLACE INTO master_locations
  (location_id, location_name, location_outinside, location_division, image_url1, image_url2)
VALUES
  (15, '江戸川区文化スポーツプラザ', '室内', 'バスケ', 'location_img/江戸川区文化スポーツプラザ.jpg', 'location_img/江戸川区文化スポーツプラザ2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (1, 'ピラノドミノ', '後藤', 2, 4, 45, 'http://info.kenbill.com/?p=3587', '同じ色同士ピラミッドを組み立てるゲーム', '', 'boardgames_img/ピラミドミノ.jpg', 'boardgames_img/ピラミドミノ2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (2, '斯くして我は独裁者に成れり', '後藤', 4, 12, 30, 'https://ahcahc.com/creative-ahc/kushiteha/', 'なんか役職でバトルするやつ', '', 'boardgames_img/斯くして我は独裁者に成れり.jpg', 'boardgames_img/斯くして我は独裁者に成れり2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (3, 'ことば落とし', '後藤', 2, 8, 5, 'https://jelly2games.com/worddrop', '指定されたワードを3分以内にトークで言うゲーム', '', 'boardgames_img/ことば落とし.jpg', 'boardgames_img/ことば落とし2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (4, 'はぁっていうゲーム', '後藤', 2, 6, 3, 'https://www.gentosha.co.jp/s/haa-game/', 'お題の単語を喋って、それがどの場面なのかを当てるゲーム', '', 'boardgames_img/はぁっていうゲーム1.jpg', 'boardgames_img/はぁっていうゲーム2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (5, '人狼', '後藤', 4, 14, 50, NULL, '人狼をやっつけるゲーム', NULL, 'boardgames_img/人狼.jpg', 'boardgames_img/人狼2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (6, '宝探しいっぱい！', '後藤', 2, 6, 5, 'https://arclightgames.jp/product/576houseki/', '裏向きのカードを表にして点数を競うゲーム', '', 'boardgames_img/宝探しいっぱい！.jpg', 'boardgames_img/宝探しいっぱい！2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (7, 'ミツカルタ', '後藤', 2, 6, 10, 'https://jelly2games.com/mitsukaruta', '素早くひらがなをつなげて点数を稼ぐゲーム', '', 'boardgames_img/ミツカルタ.png', 'boardgames_img/ミツカルタ2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (8, 'コヨーテ', '小泉', 2, 10, 30, 'https://shop.jellyjellycafe.com/products/detail/27', '場の数字の合計を「コヨーテ」と言っておおまかに当てるゲーム', '', 'boardgames_img/コヨーテ.jpg', 'boardgames_img/コヨーテ2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (9, 'カタン', '和田', 2, 4, 90, 'https://www.gp-inc.jp/boardgame_catan.html', '陣地を広げていって合計点数を競うゲーム', '', 'boardgames_img/カタン.jpg', 'boardgames_img/カタン2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (10, '午前1時の大脱走', '不明', 2, 5, 20, 'https://saashiandsaashi.com/ja/products/1_am_jailbreak', '大富豪のアレンジ版みたいなやつで、手札0枚になったら勝利', '', 'boardgames_img/午後1時の大脱走.jpg', 'boardgames_img/午後1時の大脱走2.png');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (11, 'ito レインボー', '後藤', 2, 14, 15, 'https://arclightgames.jp/product/705rainbow/', NULL, NULL, 'boardgames_img/ito.jpg', 'boardgames_img/ito2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (12, 'インサイダーゲーム', '後藤', 4, 8, 15, 'https://oinkgames.com/ja/games/analog/insider/', NULL, NULL, 'boardgames_img/インサイダーゲーム.jpg', 'boardgames_img/インサイダーゲーム2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (13, 'スプレンダー', '和田', 2, 4, 30, 'https://hobbyjapan.games/splendor/', NULL, NULL, 'boardgames_img/スプレンダー.jpg', 'boardgames_img/スプレンダー2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (14, 'まっぷたツートンソウル2！', '織田', 3, 8, 30, 'https://yofukashiproject.com/mapputa/', NULL, NULL, 'boardgames_img/まっぷたツートンソウル2！.jpg', 'boardgames_img/まっぷたツートンソウル2！2.jpg');

INSERT OR REPLACE INTO boardgames
  (id, boardgame_name, owner_name, people_min, people_max, need_time, url_str, how_to_play, remarks, image_url1, image_url2)
VALUES
  (15, 'シキスラ メメントオンライン', '小泉', 2, 8, 30, 'https://www.makuake.com/project/shikisla/', '数式で殴って勝つ', NULL, 'boardgames_img/シキスラ.jpg', 'boardgames_img/シキスラ２.jpg');
