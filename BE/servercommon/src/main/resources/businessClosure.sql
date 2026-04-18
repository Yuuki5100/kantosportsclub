INSERT INTO business_closure (
    base_cd,
    year_and_month,
    closing_count,
    closing_status,
    creator_user_id,
    created_date_and_time,
    updater_user_id,
    updated_date_and_time
) VALUES
('A001', '202501', 2, '2', 'AAA', '2025-02-01 00:00:00', 'BBB', '2025-02-03 00:00:00'),
('A001', '202502', 1, '2', 'AAA', '2025-03-01 00:00:00', 'AAA', '2025-03-03 00:00:00'),
('A002', '202501', 1, '3', 'AAA', '2025-04-01 00:00:00', 'BBB', '2025-04-02 00:00:00'),
('B001', '202503', 1, '2', 'CCC', '2025-04-01 00:00:00', 'CCC', '2025-04-03 00:00:00');
