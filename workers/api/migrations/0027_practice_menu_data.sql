-- 本番 DB の練習メニュー（practiceMenuHeader / practiceMenuDetail）を同期する。
-- 0017_practiceMenu.sql はテーブル作成のみで、データは migrations に無かった。

INSERT OR REPLACE INTO practiceMenuHeader
  (id, title, remarks, updater)
VALUES
  (1, '5/23 バスケ練習メニュー', NULL, 'wada');

INSERT OR REPLACE INTO practiceMenuHeader
  (id, title, remarks, updater)
VALUES
  (2, '5/30 バスケ練習メニュー', '阿部ちゃん離脱のため早め試合', 'wada');

INSERT OR REPLACE INTO practiceMenuHeader
  (id, title, remarks, updater)
VALUES
  (3, '6/27 練習メニュー', '人が集まるのが確定出ないため仮決定', 'gotou');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (71, 1, NULL, '準備運動&個人自由練習', 30, NULL, NULL, NULL, 1, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (72, 1, NULL, 'レイアップ左右', 15, NULL, NULL, NULL, 2, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (73, 1, NULL, 'セットシュート', 15, NULL, NULL, NULL, 3, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (74, 1, NULL, '1 on 1', 30, NULL, NULL, NULL, 4, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (75, 1, NULL, 'フリースロー', 15, NULL, NULL, NULL, 5, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (76, 1, NULL, 'ラン＆シュート', 15, NULL, NULL, NULL, 6, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (77, 1, NULL, '1 on 1？', 45, NULL, NULL, NULL, 7, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (78, 1, NULL, '清掃', 15, NULL, NULL, NULL, 8, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (97, 2, NULL, '9:00〜10:00 個人練習', 60, NULL, NULL, NULL, 1, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (98, 2, NULL, '【10:00〜10:30】', NULL, NULL, NULL, NULL, 2, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (99, 2, NULL, '個人練習', 10, NULL, NULL, NULL, 3, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (100, 2, NULL, 'レイアップシュート', 10, NULL, NULL, NULL, 4, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (101, 2, NULL, 'セットシュート', 10, NULL, NULL, NULL, 5, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (102, 2, NULL, '【10:30〜11:30】', NULL, NULL, NULL, NULL, 6, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (103, 2, NULL, '3 on 3', 60, NULL, NULL, NULL, 7, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (104, 2, NULL, '【11:30〜12:00】', NULL, NULL, NULL, NULL, 8, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (105, 2, NULL, 'フリースローチャレンジ', 15, NULL, NULL, NULL, 9, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (106, 2, NULL, 'シュートチャレンジ', 15, NULL, NULL, NULL, 10, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (107, 2, NULL, '【12:00〜13:00】', NULL, NULL, NULL, NULL, 11, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (108, 2, NULL, '2 on 2？', 45, NULL, NULL, NULL, 12, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (109, 2, NULL, '清掃', 15, NULL, NULL, NULL, 13, 'wada');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (127, 3, NULL, '自主練', 30, NULL, '12:00', '12:30', 1, 'gotou');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (128, 3, NULL, 'レイアップ', 30, NULL, '12:30', '13:00', 2, 'gotou');

INSERT OR REPLACE INTO practiceMenuDetail
  (id, headerId, category, menuName, menuTime, timeWhite, startTime, endTime, sortNo, updater)
VALUES
  (129, 3, NULL, 'バスケ', 90, NULL, '13:00', '15:00', 3, 'gotou');
