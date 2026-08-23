-- 本番 DB の mypage（選手プロフィール）を同期する。
-- migrations 側は 0020 で追加した hyuya の 1 行しか持っていなかった。
--
-- 注意: 本番の mypage は CREATE TABLE 時のカンマ誤りにより
-- 「jersey_number（型なし）」と「INTEGER」という 2 カラムに分かれてしまっている。
-- migrations 側（0012_mypage.sql）の jersey_number INTEGER が正しいため、
-- 不正な INTEGER カラムは再現せず、値は jersey_number にのみ入れる。

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (1, 'admin', '管理者', 0, 'がんばります', 'F / G', 'テストですｗ', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/noimage.jpeg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (2, 'user', '一般', 0, 'がんばります', 'F / G', 'テスト', 'mypage/noimage.jpeg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (3, 'viewer', '閲覧', 0, 'がんばります', 'F / G', 'テストです', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/noimage.jpeg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (4, 'gotou', 'Y.GOTO', 33, 'シュートをちゃんと決めれるようになりたいです！', 'F / C', 'たまに抜けてるところあるので注意してやってください', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/gotou.jpg', 'ドライブできます！');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (5, 'TAICHI', '-', 62, 'サポート頑張ります', 'F / G', 'しばらくトロントにいます。参加はできないですが、リモートから試合動画の振り返りなどさせていただきます', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/taichi.jpg', '・シュート/パス' || char(10) || '・オフボール');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (6, 'wada', 'WS', 22, '敵の裏をかいてゴールに繋げます！', 'F / G', '◼︎得意' || char(10) || 'ドリブルスピード(オールコート)' || char(10) || 'ジャンプ力' || char(10) || 'スティール' || char(10) || 'ディフェンスを引き剥がす動き' || char(10) || '' || char(10) || '' || char(10) || '◼︎苦手' || char(10) || 'スタミナ' || char(10) || 'シュート精度向上中' || char(10) || '', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/wada.jpg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (7, 'T.K.', 'T.K.', 66, 'がんばります', 'C', 'テスト', 'mypage/takamura.jpg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (8, 'abe', 'ABE', 84, 'スリーポイントが届くようになりたい', 'F', '所持品' || char(10) || '■バスケットボール：' || char(10) || '①Wilson NCAA EVO NXT（人工皮革・BCL/BAL/NCAA公式球）' || char(10) || '②molten BG5000（天然皮革・FIBA公式球）' || char(10) || '③Wilson NBA AUTHENTIC（人工皮革・NBA公式球レプリカ）' || char(10) || '■バッシュ：' || char(10) || 'ASICS SWIFTACE' || char(10) || '■空気入れ' || char(10) || '■空気針潤滑剤' || char(10) || '■三脚', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/abe.jpg', '学ぶ心');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (9, 'koizumi', 'KOIZUMI', 11, 'がんばります', 'F / G', 'テスト', 'mypage/koizumi.jpg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (10, 'SEIYA', 'KAWAHARA', 99, '全勝！全勝！全勝！', 'F', '2026年はほぼ参加不可と思われます' || char(10) || '来年いっぱい参加したいな', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/kawahara.jpg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (11, 'TAKAFMI', 'TAKAFUMI', 77, '程よく楽しく', 'F', '旅に出ます。探さないでください。', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/noimage.jpeg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (12, 'keita', 'KEITA', 44, 'がんばります', 'C', 'テスト', 'mypage/keita.jpg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (13, 'narita', 'YU', 8, '東京済みではないのてたまに参加します', 'C', '特にないかな', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/yu.jpg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (14, 'oosawa', 'OSAWA', 34, '体の強さが大事', 'C', 'たまに参加します', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/noimage.jpeg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (15, 'araki', 'shinon', 98, 'もしかしたら参加します', '', '自宅と開催地が遠いのでオンラインだったらすぐ会えます', 'https://pub-98d15c06f9fc4194a7766aa3e4313e17.r2.dev/mypage/noimage.jpeg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (16, 'orita', 'O.D.', 13, 'がんばります', 'F', 'テスト', 'mypage/orita.jpg', 'シュート打てます');

INSERT OR REPLACE INTO mypage
  (user_id, user_name, user_name_jpn, jersey_number, enthusiasm, hope_style, remarks, image_url, strengths)
VALUES
  (17, 'hyuya', NULL, NULL, 'がんばります', 'F / G', 'テストですｗ', 'mypage/noiamge.jpeg', 'シュート打てます');
