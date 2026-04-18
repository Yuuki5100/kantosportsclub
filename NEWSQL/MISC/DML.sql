USE app;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

SET @SYS_USER_ID = 'S0001';
SET @ADMIN_ROLE_ID = 1;

-- Password = password123
SET @SYS_USER_PASSWORD = '$2a$10$TaYZ6iGyjJRHX49maWEl7.raBs/Cj.FP4JI/rmWgLackQfuCtML/C';

INSERT INTO roles (
  role_id,
  role_name,
  description,
  is_deleted,
  deletion_reason,
  creator_user_id,
  created_at,
  editor_user_id,
  updated_at
)
VALUES (
  @ADMIN_ROLE_ID,
  'System Administrator',
  'Full access to the first 5 permissions',
  FALSE,
  NULL,
  @SYS_USER_ID,
  CURRENT_TIMESTAMP,
  @SYS_USER_ID,
  CURRENT_TIMESTAMP
);

INSERT INTO users (
  user_id,
  password,
  given_name,
  surname,
  mobile_no,
  email,
  role_id,
  password_set_time,
  failed_login_attempts,
  is_locked_out,
  lock_out_time,
  latest_login_time,
  is_deleted,
  deletion_reason,
  creator_user_id,
  created_at,
  editor_user_id,
  updated_at
)
VALUES (
  @SYS_USER_ID,
  @SYS_USER_PASSWORD,
  'System',
  'Admin',
  NULL,
  'sysadmin@example.com',
  @ADMIN_ROLE_ID,
  CURRENT_TIMESTAMP,
  0,
  FALSE,
  NULL,
  NULL,
  FALSE,
  NULL,
  @SYS_USER_ID,
  CURRENT_TIMESTAMP,
  @SYS_USER_ID,
  CURRENT_TIMESTAMP
);

INSERT INTO permissions (
  permission_id,
  permission_name,
  module,
  creator_user_name,
  created_at
)
VALUES
  (1, 'USER',           'SYSTEM', @SYS_USER_ID, CURRENT_TIMESTAMP),
  (2, 'ROLE',           'SYSTEM', @SYS_USER_ID, CURRENT_TIMESTAMP),
  (3, 'SYSTEM_SETTING', 'SYSTEM', @SYS_USER_ID, CURRENT_TIMESTAMP),
  (4, 'NOTICE',         'SYSTEM', @SYS_USER_ID, CURRENT_TIMESTAMP),
  (5, 'MANUAL',         'MANUAL', @SYS_USER_ID, CURRENT_TIMESTAMP);

INSERT INTO status_levels (
  status_level_id,
  status_level_name
)
VALUES
  (1, 'NONE'),
  (2, 'READ'),
  (3, 'WRITE');

INSERT INTO role_permissions (
  role_id,
  permission_id,
  status_level_id
)
VALUES
  (@ADMIN_ROLE_ID, 1, 3),
  (@ADMIN_ROLE_ID, 2, 3),
  (@ADMIN_ROLE_ID, 3, 3),
  (@ADMIN_ROLE_ID, 4, 3),
  (@ADMIN_ROLE_ID, 5, 3);

INSERT INTO system_setting (
  id,
  company_name,
  password_validity_days,
  password_attempt_validity_count,
  password_reissue_url_expiration_date,
  number_of_days_available_for_reservation,
  number_of_retries,
  number_of_notices,
  creator_user_id,
  created_date_and_time,
  updater_user_id,
  updated_date_and_time
)
VALUES (
  '1',
  'BizFlow',
  30,
  5,
  30,
  30,
  5,
  10,
  @SYS_USER_ID,
  CURRENT_TIMESTAMP,
  @SYS_USER_ID,
  CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
