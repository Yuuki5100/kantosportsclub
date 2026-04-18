--本.sqlはバッチ結果一覧のテストデータです--
INSERT INTO common.master_base (
    id,
    base_cd,
    base_name,
    abbreviation_name,
    base_category,
    postal_cd,
    address,
    telephone_number,
    fax_number,
    deleted_flag,
    reason_for_deletion,
    creator_user_id,
    created_date_and_time,
    updater_user_id,
    updated_date_and_time
) VALUES (
    'BASE01',           -- id（14桁以内）
    '001',              -- base_cd（5桁以内）
    'テスト拠点',       -- base_name（20桁以内）
    '拠点略称',         -- abbreviation_name（10桁以内）
    '001',              -- base_category（3桁以内）
    '1234567',          -- postal_cd（7桁、ハイフン無し）
    '東京都港区1-2-3', -- address（140桁以内）
    '0312345678',       -- telephone_number（11桁、ハイフン無し）
    '0398765432',       -- fax_number（11桁、ハイフン無し）
    0,                  -- deleted_flag（0=未削除）
    NULL,               -- reason_for_deletion
    'admin_user',       -- creator_user_id（100桁以内）
    NOW(),              -- created_date_and_time
    'admin_user',       -- updater_user_id（100桁以内）
    NOW()               -- updated_date_and_time
);

INSERT INTO registration_step (
    identification_id,
    menu_function_id,
    registration_status,
    comment,
    deleted_flag,
    approver_user_id,
    creator_user_id,
    created_date_and_time,
    updater_user_id,
    updated_date_and_time
) VALUES (
    'BASE01',            -- identification_id（例：master_base.idと一致）
    100,                 -- menu_function_id（任意のメニューIDでOK）
    '5',                 -- registration_status（5〜7）
    NULL,                -- comment（任意）
    0,                   -- deleted_flag（未削除）
    'admin_user',        -- approver_user_id
    'admin_user',        -- creator_user_id
    NOW(),               -- created_date_and_time
    'admin_user',        -- updater_user_id
    NOW()                -- updated_date_and_time
);


INSERT INTO common.BATCH_JOB_INSTANCE (
    JOB_INSTANCE_ID,
    VERSION,
    JOB_NAME,
    JOB_KEY,
    ERROR_DISPLAY_TYPE
) VALUES (
    1001,
    1,
    'itemCategoryExportJob',  -- ← BatchInfoのbatchNameを使用
    'KEY1001',
    '1'
);


INSERT INTO common.BATCH_JOB_EXECUTION (
    JOB_EXECUTION_ID,
    VERSION,
    JOB_INSTANCE_ID,
    CREATE_TIME,
    START_TIME,
    END_TIME,
    STATUS,
    EXIT_CODE,
    EXIT_MESSAGE,
    LAST_UPDATED
) VALUES (
    2001,
    1,
    1001,
    '2025-07-01 09:55:00',
    '2025-07-01 10:00:00',
    '2025-07-01 10:05:00',
    'COMPLETED',
    'COMPLETED',
    NULL,
    '2025-07-01 10:05:00'
);


INSERT INTO common.job_execution_base (
    job_execution_id,
    base_cd
) VALUES (
    2001,     -- job_execution_id
    '001'     -- base_cd (VARCHAR(5)以内、master_baseのbase_cdと一致させる)
);
-- 正常ケース1--

--正常ケース2--
INSERT INTO common.master_base (
    id, base_cd, base_name, abbreviation_name, base_category,
    postal_cd, address, telephone_number, fax_number, deleted_flag,
    reason_for_deletion, creator_user_id, created_date_and_time, updater_user_id, updated_date_and_time
) VALUES (
    'BASE02',
    '002',                  -- base_cd: 「002」で検索するとヒット
    '大阪テスト拠点',        -- base_name: ヒットしない想定
    '拠点略称2',
    '002',
    '5300001',
    '大阪市北区梅田1-1-1',
    '0612345678',
    '0612345679',
    0,
    NULL,
    'tester',
    NOW(),
    'tester',
    NOW()
);

INSERT INTO common.registration_step (
    identification_id, menu_function_id, registration_status,
    comment, deleted_flag, approver_user_id, creator_user_id,
    created_date_and_time, updater_user_id, updated_date_and_time
) VALUES (
    'BASE02', 200, '6', NULL, 0, 'tester', 'tester', NOW(), 'tester', NOW()
);

INSERT INTO common.BATCH_JOB_INSTANCE (
    JOB_INSTANCE_ID,
    VERSION,
    JOB_NAME,
    JOB_KEY,
    ERROR_DISPLAY_TYPE
) VALUES (
    1002,                         -- 新しいID
    1,
    'testExportJob_002',          -- テスト用のバッチ名
    'KEY1002',
    '1'
);

INSERT INTO common.BATCH_JOB_EXECUTION (
    JOB_EXECUTION_ID,
    VERSION,
    JOB_INSTANCE_ID,
    CREATE_TIME,
    START_TIME,
    END_TIME,
    STATUS,
    EXIT_CODE,
    EXIT_MESSAGE,
    LAST_UPDATED
) VALUES (
    2002,              -- 新しいID
    1,
    1002,              -- 上で登録した JOB_INSTANCE_ID
    '2025-08-01 09:00:00',
    '2025-08-01 09:05:00',
    '2025-08-01 09:10:00',
    'COMPLETED',
    'COMPLETED',
    NULL,
    '2025-08-01 09:10:00'
);

INSERT INTO common.job_execution_base (
    job_execution_id,
    base_cd
) VALUES (
    2002,      -- 上で登録した JOB_EXECUTION_ID
    '002'      -- master_base の base_cd
);

INSERT INTO common.BATCH_JOB_INSTANCE (
    JOB_INSTANCE_ID, VERSION, JOB_NAME, JOB_KEY, ERROR_DISPLAY_TYPE
) VALUES (
    1003, 1, 'errorTestJob_001', 'KEY1003', '1'
);

INSERT INTO common.BATCH_JOB_EXECUTION (
    JOB_EXECUTION_ID, VERSION, JOB_INSTANCE_ID,
    CREATE_TIME, START_TIME, END_TIME,
    STATUS, EXIT_CODE, EXIT_MESSAGE, LAST_UPDATED
) VALUES (
    2003, 1, 1003,
    '2025-08-01 11:00:00', '2025-08-01 11:05:00', '2025-08-01 11:10:00',
    'FAILED', 'FAILED',
    'com.example.servercommon.exception.CustomException: UNEXPECTED_ERROR: 想定外エラーが発生しました at com.example...',
    '2025-08-01 11:10:00'
);

INSERT INTO common.job_execution_base (job_execution_id, base_cd)
VALUES (2003, '001');

INSERT INTO common.BATCH_JOB_INSTANCE (
    JOB_INSTANCE_ID, VERSION, JOB_NAME, JOB_KEY, ERROR_DISPLAY_TYPE
) VALUES (
    1004, 1, 'errorTestJob_002', 'KEY1004', '1'
);

INSERT INTO common.BATCH_JOB_EXECUTION (
    JOB_EXECUTION_ID, VERSION, JOB_INSTANCE_ID,
    CREATE_TIME, START_TIME, END_TIME,
    STATUS, EXIT_CODE, EXIT_MESSAGE, LAST_UPDATED
) VALUES (
    2004, 1, 1004,
    '2025-08-01 12:00:00', '2025-08-01 12:05:00', '2025-08-01 12:10:00',
    'FAILED', 'FAILED',
    'java.lang.Exception: ACTUAL_UNLOAD_AMOUNT_EXCEEDS_CAPACITY: 積載量超過エラー at com.example...',
    '2025-08-01 12:10:00'
);

INSERT INTO common.job_execution_base (job_execution_id, base_cd)
VALUES (2004, '002');


-- Error Case 3: REPORT_DATA_FETCH_FAILED
INSERT INTO common.BATCH_JOB_INSTANCE (
    JOB_INSTANCE_ID, VERSION, JOB_NAME, JOB_KEY, ERROR_DISPLAY_TYPE
) VALUES (
    1005, 1, 'errorTestJob_003', 'KEY1005', '1'
);

INSERT INTO common.BATCH_JOB_EXECUTION (
    JOB_EXECUTION_ID, VERSION, JOB_INSTANCE_ID,
    CREATE_TIME, START_TIME, END_TIME,
    STATUS, EXIT_CODE, EXIT_MESSAGE, LAST_UPDATED
) VALUES (
    2005, 1, 1005,
    '2025-08-01 13:00:00', '2025-08-01 13:05:00', '2025-08-01 13:10:00',
    'FAILED', 'FAILED',
    'com.example.servercommon.exception.CustomException: REPORT_DATA_FETCH_FAILED: 帳票データ取得に失敗しました at com.example...',
    '2025-08-01 13:10:00'
);

INSERT INTO common.job_execution_base (job_execution_id, base_cd)
VALUES (2005, '001');
