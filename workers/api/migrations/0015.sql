UPDATE mypage
SET image_url = 'mypage/yu.jpg',
    update_at = CURRENT_TIMESTAMP
WHERE user_id = 13;

UPDATE mypage
SET image_url = 'mypage/gotou.jpg',
    update_at = CURRENT_TIMESTAMP
WHERE user_id = 4;

UPDATE mypage
SET image_url = 'mypage/kawahara.jpg',
    update_at = CURRENT_TIMESTAMP
WHERE user_id = 10;

UPDATE mypage
SET image_url = 'mypage/keita.jpg',
    update_at = CURRENT_TIMESTAMP
WHERE user_id = 12;

UPDATE mypage
SET image_url = 'mypage/koizumi.jpg',
    update_at = CURRENT_TIMESTAMP
WHERE user_id = 9;

UPDATE mypage
SET image_url = 'mypage/orita.jpg',
    update_at = CURRENT_TIMESTAMP
WHERE user_id = 16;

UPDATE mypage
SET image_url = 'mypage/taichi.jpg',
    update_at = CURRENT_TIMESTAMP
WHERE user_id = 5;

UPDATE mypage
SET image_url = 'mypage/wada.jpg',
    update_at = CURRENT_TIMESTAMP
WHERE user_id = 6;

UPDATE mypage
SET image_url = 'mypage/takamura.jpg',
    update_at = CURRENT_TIMESTAMP
WHERE user_id = 7;

UPDATE mypage
SET 
  image_url = 'mypage/noimage.jpeg',
  update_at = CURRENT_TIMESTAMP
WHERE image_url LIKE '%空ファイル.png';