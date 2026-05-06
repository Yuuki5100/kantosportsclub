ALTER TABLE notices ADD COLUMN start_hour TEXT;
ALTER TABLE notices ADD COLUMN end_hour TEXT;
ALTER TABLE notices ADD COLUMN money TEXT;
ALTER TABLE notices ADD COLUMN dateandtime TEXT;

UPDATE notices
SET start_hour = COALESCE(start_hour, '00:00'),
    end_hour = COALESCE(end_hour, '00:00'),
    money = COALESCE(money, '')
WHERE start_hour IS NULL OR end_hour IS NULL OR money IS NULL;
