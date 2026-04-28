UPDATE movies
SET
  url = 'https://www.w3schools.com/html/mov_bbb.mp4',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 1 AND url = 'https://example.com/movies/sample-1.mp4';

UPDATE movies
SET
  url = 'https://www.w3schools.com/html/movie.mp4',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 2 AND url = 'https://example.com/movies/sample-2.mp4';

UPDATE pictures
SET
  url = 'https://www.w3schools.com/html/pic_trulli.jpg',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 1 AND url = 'https://example.com/pictures/sample-1.jpg';

UPDATE pictures
SET
  url = 'https://www.w3schools.com/html/img_girl.jpg',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 2 AND url = 'https://example.com/pictures/sample-2.jpg';

UPDATE app_metadata
SET value = '0003_update_media_sample_urls', updated_at = CURRENT_TIMESTAMP
WHERE key = 'schema_version';
