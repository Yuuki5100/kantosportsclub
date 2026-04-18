INSERT INTO master_client (
    id,
    client_cd,
    client_identifier,
    start_of_application_date,
    deleted_flag,
    reason_for_deletion,
    creator_user_id,
    created_date_and_time,
    updater_user_id,
    updated_date_and_time
) VALUES (
    'TI20250603-01',          -- id
    'CLNT001',                -- client_cd
    'SJ',                     -- client_identifier
    '2025-06-01',             -- start_of_application_date
    false,                    -- deleted_flag
    NULL,                     -- reason_for_deletion
    'admin',                  -- creator_user_id
    '2025-06-03 08:00:00',    -- created_date_and_time
    'admin',                  -- updater_user_id
    '2025-06-03 09:00:00'     -- updated_date_and_time
);
