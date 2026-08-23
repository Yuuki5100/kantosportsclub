-- 本番 DB のコンテンツデータ（movies / pictures / notices / contact）を同期する。
-- migrations 側は疎通確認用のサンプル行しか持っていなかったため、
-- 同じ id のサンプル行は本番の実データで置き換わる。
-- notices の start_hour / end_hour / money は 0021_notice_hour_money.sql で
-- 追加したカラムを利用している。
-- auth_refresh_token（セッショントークン）は運用データのため対象外。

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (1, 'バスケ', '総集編', 'https://youtube.com/playlist?list=PL2DAPbPavahe4kTdHWgucj5wJSK1aLhEP&si=96w3hMdB2Ie2DVqX', '2.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (2, 'バスケ', '太一、河原、高村、小泉、織田', 'https://youtube.com/playlist?list=PL2DAPbPavahfOTINgccACmyLAN6Ox3Oeh&si=EDlA6MYPwE1rLh_B', '1.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (3, 'バスケ', '太一、和田、高村、後藤、小泉', 'https://youtube.com/playlist?list=PL2DAPbPavahfBa8laggJGEmULQoxcrepl&si=ETWzsLO29VQUKByk', '1.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (4, 'バスケ', '太一、和田、高村、後藤、聖人、成田', 'https://youtube.com/playlist?list=PL2DAPbPavahdxEDAElCDWESDHLKTDfozM&si=aZqkIzLl4EumxmT1', '1.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (5, 'バスケ', '太一、高村、河原、後藤', 'https://youtube.com/playlist?list=PL2DAPbPavahepXSwJcpAvEZave4CxFcMv&si=CoZU--c7rysP0-yM', '1.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (6, 'バスケ', '太一、和田、河原、小泉', 'https://youtube.com/playlist?list=PL2DAPbPavahfzEtAHs3o4tb_uZYDWz5Nf&si=UR3ZkIwqF4rcWLzB', '1.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (7, 'バスケ', '太一、和田、高村、後藤、小泉', 'https://youtube.com/playlist?list=PL2DAPbPavaheqAE6gaWOlfJtN3hgBNRYi&si=ojXvN9Qt8MHmH3CU', '1.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (8, '忘年会', '', 'https://youtu.be/mMvR0j2cbaU?si=XDzhFmFt_XqjHtfg', '3.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (9, 'バスケ', '太一、和田、高村、河原、後藤、圭太', 'https://youtube.com/playlist?list=PL2DAPbPavahc4f3FRw3RivWh2JwzblP-M&si=_BHUJUX16r7cenQ3', '2.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (10, 'バスケ', '太一、和田、高村、圭太', 'https://youtube.com/playlist?list=PL2DAPbPavahf78ZtLGFA5VeURyI4QC0xA&si=FuAeXG-zGSzz-di8', '1.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (11, 'バスケ', '太一、圭太、和田、高村、阿部', 'https://youtube.com/playlist?list=PL2DAPbPavahfV-L1FHgs6mWEdtyQYgnLm&si=icL6LU9YOJ2NH71i', '1');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (12, 'バスケ', '後藤、和田、高村、阿部', 'https://youtube.com/playlist?list=PL2DAPbPavahcAV2lloKUEBT7xqn3697sJ&si=f7J6fatEnBqEmcQt', '1');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (13, '0523 バスケ', '自由参加デイです', 'https://youtube.com/playlist?list=PL2DAPbPavahf3W436K8HcC5eRZmUNBK91&si=VP0MA4bLARNRjLw4', '1.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (14, '20260530 バスケ', '和田、高村、後藤、阿部、総理、圭太' || char(10) || '阿部ちゃん途中離脱', 'https://www.youtube.com/playlist?list=PL2DAPbPavahfABIx9MQ6BZgLqBcS-P9Ef', '1.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (15, '6/20 バスケ', '和田、阿部、飛悠哉' || char(10) || 'ひゅうや君初参戦', 'https://m.youtube.com/playlist?list=PLAjM8ayZYdOw&ra=m', '15.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (16, '6/27 バスケ', '和田、高村、後藤、総理、河原、阿部' || char(10) || 'せいや久々の参加', 'https://youtube.com/playlist?list=PLPjC66UaMEpE&si=GwhN--9L8UVOePWy', '1.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (17, '20260718 バスケ', '和田、阿部', 'https://www.youtube.com/playlist?list=PLZXjD47hiL_4', '15.0');

INSERT OR REPLACE INTO movies
  (id, title, description, url, location_id)
VALUES
  (18, '20260725 バスケ', '和田、高村、後藤、阿部、川原、飛悠哉', 'https://www.youtube.com/playlist?list=PLcRU17s0GbCo', '1.0');

INSERT OR REPLACE INTO pictures
  (id, title, description, url, location_id)
VALUES
  (1, '忘年会', '太一、和田、高村、川原、後藤、小泉、孝文', 'https://drive.google.com/drive/folders/1SLXuLnsnwGV21IssMr2dInA4HA928jvp?usp=drive_link', '11.0');

INSERT OR REPLACE INTO pictures
  (id, title, description, url, location_id)
VALUES
  (2, 'ボドゲ', '太一、和田、高村、川原、後藤、孝文', 'https://drive.google.com/drive/folders/1lSvoh0Uh3ruv7WIQ8TozAFZjWBFwGvMU?usp=drive_link', '10.0');

INSERT OR REPLACE INTO pictures
  (id, title, description, url, location_id)
VALUES
  (3, 'ボドゲ', '太一、和田、高村、小泉、織田', 'https://drive.google.com/drive/folders/1ExyVQt2MGs4ckhzDnDLxy4a7TIjOwP7r', '10.0');

INSERT OR REPLACE INTO pictures
  (id, title, description, url, location_id)
VALUES
  (4, '忘年会', '太一、和田、高村、川原、後藤、小泉、織田', 'https://drive.google.com/drive/folders/1W66gguSLqdofVCpLM2Yhkmu_-twfytsx?usp=drive_link', '10.0');

INSERT OR REPLACE INTO notices
  (id, title, station, location_id, people, people_name, remarks, public_at, closed_at, start_hour, end_hour, money, dateandtime)
VALUES
  (1, '5/30 バスケ', '横浜', 1, 5, '和田、高村、後藤、小泉、阿部', '【当日必要な物】' || char(10) || '==========================' || char(10) || '①室内用シューズ（バッシュなど）' || char(10) || '　※屋外シューズは基本NG' || char(10) || '②着替え & タオル' || char(10) || '③現金or 電子マネー' || char(10) || '④ドリンク' || char(10) || '⑤バスケットボール' || char(10) || '⑥ビブス' || char(10) || '⑦ボードゲーム' || char(10) || '==========================' || char(10) || '' || char(10) || '【備品持参者】' || char(10) || '=============================' || char(10) || '三脚　　　：後藤' || char(10) || '空気入れ　：後藤' || char(10) || 'ＩＰａｄ　：後藤' || char(10) || 'ボード　　：和田' || char(10) || 'ビブス予備：高村' || char(10) || '==========================', '2026-04-30 10:00:00', '2026-05-30 20:00:00', '10:00', '16:00', 660, '2026-05-30');

INSERT OR REPLACE INTO notices
  (id, title, station, location_id, people, people_name, remarks, public_at, closed_at, start_hour, end_hour, money, dateandtime)
VALUES
  (2, '5/23 バスケ', '横浜', 1, 4, '和田、高村、後藤、阿部', '【当日必要な物】' || char(10) || '==========================' || char(10) || '①室内用シューズ（バッシュなど）' || char(10) || '　※屋外シューズは基本NG' || char(10) || '②着替え & タオル' || char(10) || '③現金or 電子マネー' || char(10) || '④ドリンク' || char(10) || '⑤バスケットボール' || char(10) || '⑥ビブス' || char(10) || '⑦ボードゲーム' || char(10) || '==========================' || char(10) || '' || char(10) || '【備品持参者】' || char(10) || '=============================' || char(10) || '三脚　　　：後藤' || char(10) || '空気入れ　：後藤' || char(10) || 'ＩＰａｄ　：後藤' || char(10) || 'ボード　　：和田' || char(10) || 'ビブス予備：高村' || char(10) || '==========================', '2026-05-01 09:00', '2026-05-23 18:00', '10:00', '16:00', 440, '2026-05-23');

INSERT OR REPLACE INTO notices
  (id, title, station, location_id, people, people_name, remarks, public_at, closed_at, start_hour, end_hour, money, dateandtime)
VALUES
  (3, '6/27 バスケ（神奈川）', '横浜駅', 1, 6, '和田、小泉、後藤、阿部、高村、せいや', NULL, '2026-06-20 00:00', '2026-06-28 00:00', '12:00', '15:00', '360円', '2022-06-27');

INSERT OR REPLACE INTO notices
  (id, title, station, location_id, people, people_name, remarks, public_at, closed_at, start_hour, end_hour, money, dateandtime)
VALUES
  (4, '江戸川区（バスケ）', NULL, 15, 3, '和田、阿部、後藤', NULL, '2026-07-05 00:00', '2026-07-18 00:00', '9:00', '15:00', '1100円', '2026-07-17');

INSERT OR REPLACE INTO notices
  (id, title, station, location_id, people, people_name, remarks, public_at, closed_at, start_hour, end_hour, money, dateandtime)
VALUES
  (5, '7/25 バスケ（神奈川）', '横浜駅', 10, 6, '和田、高村、阿部、河原、後藤、渡邊', NULL, '2026-07-24 00:00', '2026-07-26 12:00', '13:00', '16:00', '360円', '2026-07-25');

INSERT OR REPLACE INTO contact
  (id, type, status, display, sentence, reporter)
VALUES
  ('d48218a0-1d54-4552-b35d-271ff7612343', '不具合', '未対応', '選手一覧', '選手名長いとデザイン崩れる', 'gotou');

INSERT OR REPLACE INTO contact
  (id, type, status, display, sentence, reporter)
VALUES
  ('062fa228-9a41-472a-822b-863d4d7ea96b', '不具合', '完了', 'トップ', '全画面でたまに何も操作できなくなる', 'gotou');

-- スキーマバージョンを最新のマイグレーションに更新する
-- （0016_contact.sql 以降、更新が漏れていた）
UPDATE app_metadata
SET value = '0028_content_data',
    updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
