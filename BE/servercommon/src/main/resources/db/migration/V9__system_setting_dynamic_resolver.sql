CREATE TABLE IF NOT EXISTS system_setting (
    id VARCHAR(45) PRIMARY KEY,
    company_name VARCHAR(20),
    password_validity_days INT,
    password_attempt_validity_count INT,
    password_reissue_url_expiration_date INT,
    number_of_days_available_for_reservation INT,
    number_of_retries INT,
    number_of_notices INT,
    creator_user_id VARCHAR(100) NOT NULL,
    created_date_and_time TIMESTAMP NOT NULL,
    updater_user_id VARCHAR(100) NOT NULL,
    updated_date_and_time TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS system_setting_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_id VARCHAR(45) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    before_value VARCHAR(255),
    after_value VARCHAR(255),
    updated_by VARCHAR(100) NOT NULL,
    updated_date_and_time TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_system_setting_history_setting_id_time
    ON system_setting_history (setting_id, updated_date_and_time);
