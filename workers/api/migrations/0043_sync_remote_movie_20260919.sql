-- リモート D1 の最新 dump で確認した movies の追加データ。
INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id, created_at, updated_at)
VALUES
  (20, '20260919 バスケ', '和田、後藤、阿部',
   'https://www.youtube.com/playlist?list=PLL9dzwwaogrE', '1.0',
   '2026-09-21 08:19:39', '2026-09-21 08:19:39');
