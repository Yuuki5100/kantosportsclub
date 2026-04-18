-- Widen manual_file columns to match notice_file column lengths
ALTER TABLE manual_file MODIFY COLUMN file_name VARCHAR(255);
ALTER TABLE manual_file MODIFY COLUMN destination_url VARCHAR(500);
