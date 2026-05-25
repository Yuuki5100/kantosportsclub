INSERT INTO endpoint_authority_mapping
  (url, method, menu_function_id, required_level, created_at, updated_at)
SELECT '/api/mypage/*', 'GET', 204, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM endpoint_authority_mapping
  WHERE url = '/api/mypage/*'
    AND method = 'GET'
);

INSERT INTO endpoint_authority_mapping
  (url, method, menu_function_id, required_level, created_at, updated_at)
SELECT '/api/mypage/*', 'PUT', 204, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM endpoint_authority_mapping
  WHERE url = '/api/mypage/*'
    AND method = 'PUT'
);

INSERT INTO endpoint_authority_mapping
  (url, method, menu_function_id, required_level, created_at, updated_at)
SELECT '/api/master_locations', 'GET', 30044, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM endpoint_authority_mapping
  WHERE url = '/api/master_locations'
    AND method = 'GET'
);
