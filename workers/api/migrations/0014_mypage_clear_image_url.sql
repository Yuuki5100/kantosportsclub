UPDATE mypage
SET image_url = NULL,
    update_at = CURRENT_TIMESTAMP
WHERE image_url IS NOT NULL
  AND TRIM(image_url) <> ''
  AND (LENGTH(image_url) > 512 OR image_url LIKE 'data:%');
