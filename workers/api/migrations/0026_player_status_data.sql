-- 本番 DB の playerStatus（選手評価）を同期する。
-- 0018_playerStatus.sql はテーブル作成のみで、データは migrations に無かった。

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (1, 1, 4, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (2, 1, 5, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (3, 1, 6, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (4, 2, 4, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (5, 2, 5, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (6, 2, 6, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (7, 3, 4, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (8, 3, 5, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (9, 3, 6, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (10, 4, 4, 2, 6, 6, 4, 6, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (11, 4, 5, 8, 8, 6, 6, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (12, 4, 6, 7, 6, 5, 5, 6, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (13, 5, 4, 8, 7, 7, 7, 8, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (14, 5, 5, 8, 8, 8, 7, 6, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (15, 5, 6, 8, 7, 6, 7, 8, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (16, 6, 4, 8, 7, 7, 8, 8, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (17, 6, 5, 9, 8, 8, 7, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (18, 6, 6, 7, 7, 7, 7, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (19, 7, 4, 8, 7, 7, 7, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (20, 7, 5, 7, 7, 8, 9, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (21, 7, 6, 7, 6, 7, 8, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (22, 8, 4, 8, 7, 7, 7, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (23, 8, 5, 7, 6, 7, 8, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (24, 8, 6, 7, 6, 6, 7, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (25, 9, 4, 8, 8, 7, 7, 8, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (26, 9, 5, 7, 7, 7, 6, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (27, 9, 6, 8, 7, 7, 6, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (28, 10, 4, 8, 7, 7, 8, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (29, 10, 5, 9, 8, 6, 8, 9, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (30, 10, 6, 8, 7, 7, 7, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (31, 11, 4, 7, 7, 7, 7, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (32, 11, 5, 8, 7, 7, 8, 4, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (33, 11, 6, 6, 6, 6, 7, 6, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (34, 12, 4, 7, 7, 7, 7, 8, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (35, 12, 5, 7, 6, 6, 8, 9, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (36, 12, 6, 6, 6, 6, 8, 8, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (37, 13, 4, 9, 8, 8, 9, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (38, 13, 5, 9, 7, 7, 10, 2, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (39, 13, 6, 8, 7, 8, 8, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (40, 14, 4, 7, 7, 7, 7, 7, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (41, 14, 5, 5, 6, 7, 7, 4, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (42, 14, 6, 6, 6, 6, 7, 6, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (43, 15, 4, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (44, 15, 5, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (45, 15, 6, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (46, 16, 4, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (47, 16, 5, 5, 5, 5, 5, 5, NULL);

INSERT OR REPLACE INTO playerStatus
  (id, user_id, review_user_id, shooting, dribbling, passing, defense, stamina, remarks)
VALUES
  (48, 16, 6, 6, 6, 6, 6, 6, NULL);
