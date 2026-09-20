-- 練習メニュー一覧の取得は未ログインでも許可する。
-- 詳細取得・登録・更新の権限は変更しない。

UPDATE endpoint_authority_mapping
SET required_level = 0
WHERE method = 'GET'
  AND url = '/api/practice-menu/headers';
