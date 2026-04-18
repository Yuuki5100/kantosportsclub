-- =========================================================
-- MySQL 8 DDL
-- =========================================================
CREATE DATABASE IF NOT EXISTS kyotsukiban_template_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE kyotsukiban_template_db;
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =========================================================
-- users
-- =========================================================
CREATE TABLE users (
  user_id                CHAR(36)      NOT NULL,
  password               VARCHAR(255)  NOT NULL,
  given_name             VARCHAR(100)  NOT NULL,
  surname                VARCHAR(100)  NOT NULL,
  mobile_no              VARCHAR(30)   NULL,
  email                  VARCHAR(254)  NULL,

  role_id                INT           NOT NULL,

  password_set_time      TIMESTAMP     NULL,
  failed_login_attempts  INT           NOT NULL DEFAULT 0,
  is_locked_out          BOOLEAN       NOT NULL DEFAULT FALSE,
  lock_out_time          TIMESTAMP     NULL,
  latest_login_time      TIMESTAMP     NULL,

  is_deleted             BOOLEAN       NOT NULL DEFAULT FALSE,
  deletion_reason        TEXT          NULL,

  creator_user_id        CHAR(36)      NOT NULL,
  created_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  editor_user_id         CHAR(36)      NOT NULL,
  updated_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),

  KEY idx_users_role_id (role_id),
  KEY idx_users_creator_user_id (creator_user_id),
  KEY idx_users_editor_user_id (editor_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- roles
-- =========================================================
CREATE TABLE roles (
  role_id                INT           NOT NULL,
  role_name              VARCHAR(100)  NOT NULL,

  description            TEXT          NULL,

  is_deleted             BOOLEAN       NOT NULL DEFAULT FALSE,
  deletion_reason        TEXT          NULL,

  creator_user_id        CHAR(36)      NOT NULL,
  created_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  editor_user_id         CHAR(36)      NOT NULL,
  updated_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (role_id),
  UNIQUE KEY uq_roles_role_name (role_name),

  KEY idx_roles_creator_user_id (creator_user_id),
  KEY idx_roles_editor_user_id (editor_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- permissions
-- =========================================================
CREATE TABLE permissions (
  permission_id          INT           NOT NULL,
  permission_name        VARCHAR(150)  NOT NULL,
  module                 VARCHAR(100)  NOT NULL,

  creator_user_name      CHAR(36)      NOT NULL,
  created_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (permission_id),
  UNIQUE KEY uq_permissions_name_module (permission_name, module),
  KEY idx_permissions_creator_user_name (creator_user_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- status_levels
-- =========================================================
CREATE TABLE status_levels (
  status_level_id        INT           NOT NULL,
  status_level_name      VARCHAR(100)  NOT NULL,

  PRIMARY KEY (status_level_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- role_permissions
-- =========================================================
CREATE TABLE role_permissions (
  role_permission_id     INT           NOT NULL AUTO_INCREMENT,
  role_id                INT           NOT NULL,
  permission_id          INT           NOT NULL,
  status_level_id        INT           NOT NULL,

  PRIMARY KEY (role_permission_id),
  UNIQUE KEY uq_role_permissions (role_id, permission_id),
  KEY idx_rp_role_id (role_id),
  KEY idx_rp_permission_id (permission_id),
  KEY idx_rp_status_level_id (status_level_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- auth_refresh_token
-- =========================================================
CREATE TABLE auth_refresh_token (
  refresh_id             INT           NOT NULL AUTO_INCREMENT,
  jti                    VARCHAR(64)   NOT NULL,
  user_id                CHAR(36)      NOT NULL,

  expires_at             TIMESTAMP     NOT NULL,
  revoked_at             TIMESTAMP     NULL,
  created_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at           TIMESTAMP     NULL,

  last_access_jti        VARCHAR(64)   NOT NULL,

  PRIMARY KEY (refresh_id),
  UNIQUE KEY uq_art_jti (jti),
  UNIQUE KEY uq_art_user_id (user_id),
  UNIQUE KEY uq_art_last_access_jti (last_access_jti),
  KEY idx_art_user_id (user_id),
  KEY idx_art_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- auth_one_time_token
-- =========================================================
CREATE TABLE auth_one_time_token (
  token_id               INT           NOT NULL AUTO_INCREMENT,
  user_id                CHAR(36)      NOT NULL,
  jti                    VARCHAR(64)   NOT NULL,
  purpose                VARCHAR(50)   NOT NULL,

  expires_at             TIMESTAMP     NOT NULL,
  created_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at                TIMESTAMP     NULL,

  PRIMARY KEY (token_id),
  UNIQUE KEY uq_aott_jti (jti),
  KEY idx_aott_user_id (user_id),
  KEY idx_aott_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- system_setting
-- =========================================================
CREATE TABLE system_setting (
  id                                     VARCHAR(45)   NOT NULL,
  company_name                           VARCHAR(20)   NULL,
  password_validity_days                 INT           NULL,
  password_attempt_validity_count        INT           NULL,
  password_reissue_url_expiration_date   INT           NULL,
  number_of_days_available_for_reservation INT         NULL,
  number_of_retries                      INT           NULL,
  number_of_notices                      INT           NULL,
  creator_user_id                        VARCHAR(100)  NOT NULL,
  created_date_and_time                  TIMESTAMP     NOT NULL,
  updater_user_id                        VARCHAR(100)  NOT NULL,
  updated_date_and_time                  TIMESTAMP     NOT NULL,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- manual
-- =========================================================
CREATE TABLE manual (
  id                     BIGINT        NOT NULL AUTO_INCREMENT,
  title                  VARCHAR(20)   NOT NULL,
  general_user_flag      BOOLEAN       NULL,
  master_admin_flag      BOOLEAN       NULL,
  system_configurator_flag BOOLEAN     NULL,
  content                VARCHAR(250)  NULL,
  deleted_flag           BOOLEAN       NOT NULL,
  creator_user_id        VARCHAR(100)  NOT NULL,
  created_date_and_time  TIMESTAMP     NOT NULL,
  updater_user_id        VARCHAR(100)  NOT NULL,
  updated_date_and_time  TIMESTAMP     NOT NULL,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- manual_file
-- =========================================================
CREATE TABLE manual_file (
  id                     BIGINT         NOT NULL AUTO_INCREMENT,
  manual_id              BIGINT         NOT NULL,
  file_name              VARCHAR(255)   NULL,
  destination_url        VARCHAR(500)   NULL,
  file_size              DECIMAL(10,3)  NULL,
  file_format            VARCHAR(20)    NULL,
  deleted_flag           BOOLEAN        NOT NULL,
  creator_user_id        VARCHAR(100)   NOT NULL,
  created_date_and_time  TIMESTAMP      NOT NULL,
  updater_user_id        VARCHAR(100)   NOT NULL,
  updated_date_and_time  TIMESTAMP      NOT NULL,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- notice
-- =========================================================
CREATE TABLE notice (
  notice_id              BIGINT        NOT NULL AUTO_INCREMENT,
  notice_title           VARCHAR(255)  NOT NULL,
  start_date             DATE          NOT NULL,
  end_date               DATE          NOT NULL,
  contents               VARCHAR(250)  NULL,
  creator_user_id        CHAR(36)      NOT NULL,
  editor_user_id         CHAR(36)      NOT NULL,
  created_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (notice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- notice_file
-- =========================================================
CREATE TABLE notice_file (
  id                     BIGINT         NOT NULL AUTO_INCREMENT,
  notice_id              BIGINT         NOT NULL,
  file_name              VARCHAR(255)   NULL,
  destination_url        VARCHAR(500)   NULL,
  file_size              DECIMAL(10,3)  NULL,
  file_format            VARCHAR(20)    NULL,
  deleted_flag           BOOLEAN        NOT NULL,
  creator_user_id        VARCHAR(100)   NOT NULL,
  created_date_and_time  TIMESTAMP      NOT NULL,
  updater_user_id        VARCHAR(100)   NOT NULL,
  updated_date_and_time  TIMESTAMP      NOT NULL,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- Foreign Keys (after all tables exist)
-- =========================================================

-- roles <-> users (note: circular dependency with users.role_id below)
ALTER TABLE roles
  ADD CONSTRAINT fk_roles_creator_user_id FOREIGN KEY (creator_user_id) REFERENCES users(user_id),
  ADD CONSTRAINT fk_roles_editor_user_id  FOREIGN KEY (editor_user_id)  REFERENCES users(user_id);

-- users self references
ALTER TABLE users
  ADD CONSTRAINT fk_users_creator_user_id FOREIGN KEY (creator_user_id) REFERENCES users(user_id),
  ADD CONSTRAINT fk_users_editor_user_id  FOREIGN KEY (editor_user_id)  REFERENCES users(user_id);

-- users.role_id -> roles
ALTER TABLE users
  ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id);

-- permissions
ALTER TABLE permissions
  ADD CONSTRAINT fk_permissions_creator_user_name
    FOREIGN KEY (creator_user_name) REFERENCES users(user_id);

-- role_permissions
ALTER TABLE role_permissions
  ADD CONSTRAINT fk_role_permissions_role
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
  ADD CONSTRAINT fk_role_permissions_permission
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id),
  ADD CONSTRAINT fk_role_permissions_status_level
    FOREIGN KEY (status_level_id) REFERENCES status_levels(status_level_id);

-- auth_refresh_token
ALTER TABLE auth_refresh_token
  ADD CONSTRAINT fk_auth_refresh_user
    FOREIGN KEY (user_id) REFERENCES users(user_id);

-- auth_one_time_token
ALTER TABLE auth_one_time_token
  ADD CONSTRAINT fk_aott_user
    FOREIGN KEY (user_id) REFERENCES users(user_id);

-- manual_file
ALTER TABLE manual_file
  ADD CONSTRAINT fk_manual_file_manual
    FOREIGN KEY (manual_id) REFERENCES manual(id);

-- notice
ALTER TABLE notice
  ADD CONSTRAINT fk_notice_creator_user_id FOREIGN KEY (creator_user_id) REFERENCES users(user_id),
  ADD CONSTRAINT fk_notice_editor_user_id  FOREIGN KEY (editor_user_id)  REFERENCES users(user_id);

-- notice_file
ALTER TABLE notice_file
  ADD CONSTRAINT fk_notice_file_notice
    FOREIGN KEY (notice_id) REFERENCES notice(notice_id);
