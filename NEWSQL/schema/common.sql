--DROP TABLE 文をここで一括実行
DROP TABLE IF EXISTS `utility_consumption_quantity_imported_header`, `master_process_category`, `work_instruction_quality_check_detail`, `work_result_quality_check_detail`, `work_result_tank_swtich_detail`, `process_recipe_calculation_result`, `manual`, `manual_file`, `job_management`, `error_information_storage`, `master_role`, `job_history`, `id_sequence`, `inventory_reservation_header`, `inventory_reservation_disposal_operator`, `inventory_reservation_pla_type`, `inventory_stop_header`, `inventory_stop_detail`, `master_item_end_of_application_date`, `master_client_end_of_application_date`, `master_role_operation_function`, `master_visit_status_end_of_application_date`, `master_employee_permit_issue_end_of_application_date`, `master_pla_type_end_of_application_date`, `plastic_form_type_recipe_end_of_application_date`, `master_account_sub_item`, `master_item_category_logic`, `utility_consumption_quantity_imported_header_detail`, `master_process_item_transaction_end_of_application_date`, `job_execution_base`, `batch_job_instance`, `master_department`, `batch_job_execution`, `batch_job_execution_params`, `batch_step_execution`, `batch_step_execution_context`, `batch_job_execution_context`, `batch_job_import_error_deital`, `endpoint_authority_mapping`, `report_master`, `report_layout`, `settings`, `master_client`, `mail_templates`, `error_codes`, `notify_queue`, `job_status`, `master_client_related_base`, `master_client_contact`, `master_client_related_company`, `master_item`, `master_item_pla_type`, `master_item_category`, `master_menu_function`, `notice`, `file`, `registration_step`, `system_setting`, `master_visit_status`, `master_employee_permit_issue`, `inventory`, `lot_header`, `lot_pla_type_detail`, `master_screen_id`, `lot_disposal_operator_detail`, `master_location`, `stock`, `end_month_stock_history`, `stock_transfer_header`, `stock_transfer_detail`, `stock_count`, `monthly_plan_header`, `monthly_plan_detail`, `master_code_definition`, `weekly_production_plan_header`, `weekly_production_plan_detail`, `master_pla_type`, `process_item_transaction_header`, `process_item_transaction_detail`, `plastic_form_type_recipe_header`, `plastic_form_type_recipe_detail`, `work_instruction_header`, `work_instruction_inventory_detail`, `work_instruction_input_detail`, `master_message`, `work_instruction_location_change_detail`, `work_instruction_tank_switch_detail`, `work_result_header`, `work_result_inventory_detail`, `work_result_input_detail`, `work_result_location_change_detail`, `manufacturing_header`, `manufacturing_detail`, `daily_report`, `business_closure`, `master_movement_type`, `production_receipt_report_header`, `production_receipt_report_detail`, `utility_consumption_quantity_header`, `utility_consumption_quantity_detail`, `quality_status`, `master_supplementary_department_allocation_rate_header`, `master_supplementary_department_allocation_rate_detail`, `master_stored_goods_department_allocation_rate_header`, `master_account_item`, `master_stored_goods_department_allocation_rate_detail`, `stored_goods_receipt_report_header`, `stored_goods_receipt_report_detail`, `utility_consumption_amount_header`, `utility_consumption_amount_detail`, `utility_consumption_report_header`, `utility_consumption_report_detail`, `supplementary_department_cost_amount_header`, `supplementary_department_cost_amount_detail`, `supplementary_department_report_header`, `master_base`, `supplementary_department_report_detail`, `manufacturing_cost_closure`, `cost_amount_header`, `cost_amount_detail`, `cost_calculation_report_header`, `cost_calculation_report_receipt_and_payment_detail`, `cost_calculation_report_product_detail`, `master_organization`, `disposal_report_header`, `disposal_report_detail`, `gate_pass`, `accepting_order`, `sales`, `purchase`, `purchase_imported`, `accounting_journal`, `manufacturing_flow_value_imported_header`, `manufacturing_flow_value_imported_detail`, `master_user`;

-- 自動生成された CREATE TABLE 文

CREATE TABLE `manual` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'id',
  `title` VARCHAR(20) NOT NULL COMMENT 'タイトル',
  `general_user_flag` TINYINT(1)  COMMENT '一般ユーザフラグ',
  `master_admin_flag` TINYINT(1)  COMMENT 'マスタ管理者フラグ',
  `system_configurator_flag` TINYINT(1)  COMMENT 'システム設定者フラグ',
  `content` VARCHAR(250)  COMMENT '説明',
  `deleted_flag` TINYINT(1) NOT NULL COMMENT '削除済フラグ',
  `creator_user_id` VARCHAR(100) NOT NULL COMMENT '作成者ユーザID',
  `created_date_and_time` DATETIME NOT NULL COMMENT '作成日時',
  `updater_user_id` VARCHAR(100) NOT NULL COMMENT '更新者ユーザID',
  `updated_date_and_time` DATETIME NOT NULL COMMENT '更新日時'
  ,PRIMARY KEY (`id`)
  ,UNIQUE (`id`)
) COMMENT='マニュアル';

CREATE TABLE `manual_file` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'id',
  `manual_id` BIGINT NOT NULL COMMENT 'マニュアルid',
  `file_name` VARCHAR(50)  COMMENT 'ファイル名',
  `destination_url` VARCHAR(100)  COMMENT '保存先URL',
  `file_size` DECIMAL(10,3)  COMMENT 'ファイルサイズ',
  `file_format` VARCHAR(20)  COMMENT 'ファイル形式',
  `deleted_flag` TINYINT(1) NOT NULL COMMENT '削除済フラグ',
  `creator_user_id` VARCHAR(100) NOT NULL COMMENT '作成者ユーザID',
  `created_date_and_time` DATETIME NOT NULL COMMENT '作成日時',
  `updater_user_id` VARCHAR(100) NOT NULL COMMENT '更新者ユーザID',
  `updated_date_and_time` DATETIME NOT NULL COMMENT '更新日時'
  ,PRIMARY KEY (`id`)
  ,UNIQUE (`id`)
) COMMENT='マニュアルファイル';


CREATE TABLE `error_information_storage` (
  `job_id` VARCHAR(14) NOT NULL COMMENT 'ジョブID',
  `step_name` VARCHAR(100) NOT NULL COMMENT 'ステップ名',
  `failed_data_id` VARCHAR(14)  COMMENT '失敗データID',
  `table_name_where_error_occurred` VARCHAR(100)  COMMENT 'エラーが発生したテーブル名',
  `column_name_where_error_occurred` VARCHAR(100)  COMMENT 'エラーが発生したカラム名',
  `value_of_problematic_data` VARCHAR(100)  COMMENT '問題のあるデータの値',
  `error_content` VARCHAR(255)  COMMENT 'エラー内容',
  `time_when_error_occurred` DATETIME  COMMENT 'エラー発生時間',
  `execution_history_id` VARCHAR(14) NOT NULL COMMENT '実行履歴ID'
  ,PRIMARY KEY (`execution_history_id`)
) COMMENT='エラー情報格納';

CREATE TABLE `master_role` (
  `id` VARCHAR(14) NOT NULL COMMENT 'id',
  `unique_id` BIGINT NOT NULL COMMENT 'ユニークID',
  `role_name` VARCHAR(20)  COMMENT 'ロール名',
  `deleted_flag` TINYINT(1)  COMMENT '削除済フラグ',
  `reason_for_deletion` VARCHAR(100)  COMMENT '削除理由',
  `creator_user_id` VARCHAR(100) NOT NULL COMMENT '作成者ユーザID',
  `created_date_and_time` DATETIME NOT NULL COMMENT '作成日時',
  `updater_user_id` VARCHAR(100) NOT NULL COMMENT '更新者ユーザID',
  `updated_date_and_time` DATETIME NOT NULL COMMENT '更新日時'
  ,PRIMARY KEY (`id`)
  ,UNIQUE (`id`, `unique_id`)
) COMMENT='ロールマスタ';


CREATE TABLE `id_sequence` (
  `id` VARCHAR(3) NOT NULL COMMENT '識別子',
  `date` DATETIME NOT NULL COMMENT '日付',
  `current_no` INTEGER NOT NULL COMMENT '現在NO'
  ,PRIMARY KEY (`id`, `date`)
) COMMENT='IDシーケンス';







CREATE TABLE `master_role_operation_function` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'id',
  `role_id` VARCHAR(14) NOT NULL COMMENT 'ロールID',
  `role_unique_id` BIGINT NOT NULL COMMENT 'ロールユニークID',
  `menu_function_id` BIGINT NOT NULL COMMENT 'メニュ機能ID',
  `authority_category` VARCHAR(3) NOT NULL COMMENT '権限区分',
  `deleted_flag` TINYINT(1)  COMMENT '削除済フラグ',
  `creator_user_id` VARCHAR(100) NOT NULL COMMENT '作成者ユーザID',
  `created_date_and_time` DATETIME NOT NULL COMMENT '作成日時',
  `updater_user_id` VARCHAR(100) NOT NULL COMMENT '更新者ユーザID',
  `updated_date_and_time` DATETIME NOT NULL COMMENT '更新日時'
  ,PRIMARY KEY (`id`)
  ,UNIQUE (`role_id`, `role_unique_id`, `menu_function_id`)
) COMMENT='ロール操作機能マスタ';


CREATE TABLE `batch_job_instance` (
  `job_instance_id` BIGINT NOT NULL COMMENT 'ジョブインスタンスID',
  `version` BIGINT  COMMENT 'バージョン',
  `job_name` VARCHAR(100) NOT NULL COMMENT 'ジョブ名',
  `job_key` VARCHAR(32) NOT NULL COMMENT 'ジョブキー',
  `error_display_type` VARCHAR(3)  COMMENT 'エラー表示タイプ'
  ,PRIMARY KEY (`job_instance_id`, `error_display_type`)
  ,UNIQUE (`job_name`, `job_key`)
) COMMENT='バッチジョブインスタンス';


CREATE TABLE `batch_job_execution` (
  `job_execution_id` BIGINT NOT NULL COMMENT 'ジョブ実行ID',
  `version` BIGINT  COMMENT 'バージョン',
  `job_instance_id` BIGINT NOT NULL COMMENT 'ジョブインスタンスID',
  `create_time` DATETIME NOT NULL COMMENT '作成日時',
  `start_time` DATETIME  COMMENT '開始日時',
  `end_time` DATETIME  COMMENT '終了日次',
  `status` VARCHAR(10)  COMMENT 'ステータス',
  `exit_code` VARCHAR(2500)  COMMENT '終了コード',
  `exit_message` VARCHAR(2500)  COMMENT '終了メッセージ',
  `last_updated` DATETIME  COMMENT '最終更新日時'
  ,PRIMARY KEY (`job_execution_id`)
) COMMENT='バッチジョブ実行';

CREATE TABLE `batch_job_execution_params` (
  `job_execution_id` BIGINT NOT NULL COMMENT 'ジョブ実行ID',
  `parameter_name` VARCHAR(100) NOT NULL COMMENT 'パラ名',
  `parameter_type` VARCHAR(100) NOT NULL COMMENT 'パラタイプ',
  `parameter_value` VARCHAR(2500)  COMMENT 'パラヴァリュー',
  `identifying` CHAR(1) NOT NULL COMMENT '識別子'
  ,PRIMARY KEY (`job_execution_id`)
) COMMENT='バッチジョブ実行パラ';

CREATE TABLE `batch_step_execution` (
  `step_execution_id` BIGINT NOT NULL COMMENT 'ステップ実行ID',
  `version` BIGINT NOT NULL COMMENT 'バージョン',
  `step_name` VARCHAR(100) NOT NULL COMMENT 'ステップ名',
  `job_execution_id` BIGINT NOT NULL COMMENT 'ジョブ実行ID',
  `create_time` DATETIME NOT NULL COMMENT '作成日時',
  `start_time` DATETIME  COMMENT '開始日時',
  `end_time` DATETIME  COMMENT '終了日次',
  `status` VARCHAR(10)  COMMENT 'ステータス',
  `commit_count` BIGINT  COMMENT 'コミット数',
  `read_count` BIGINT  COMMENT 'リード数',
  `filter_count` BIGINT  COMMENT 'フィルター数',
  `write_count` BIGINT  COMMENT 'ライト数',
  `read_skip_count` BIGINT  COMMENT 'リードスキップ数',
  `write_skip_count` BIGINT  COMMENT 'ライトスキップ数',
  `process_skip_count` BIGINT  COMMENT 'プロセススキップ数',
  `rollback_count` BIGINT  COMMENT 'ロールバック数',
  `exit_code` VARCHAR(2500)  COMMENT '終了コード',
  `exit_message` VARCHAR(2500)  COMMENT '終了メッセージ',
  `last_updated` DATETIME  COMMENT '最終更新日時'
  ,PRIMARY KEY (`step_execution_id`)
) COMMENT='バッチステップ実行';

CREATE TABLE `batch_step_execution_context` (
  `step_execution_id` BIGINT NOT NULL COMMENT 'ステップ実行ID',
  `short_context` VARCHAR(2500) NOT NULL COMMENT 'ショートコンテクスト',
  `serialized_context` TEXT  COMMENT 'シリアライズドコンテクスト'
  ,PRIMARY KEY (`step_execution_id`)
) COMMENT='バッチステップ実行状況';

CREATE TABLE `batch_job_execution_context` (
  `job_execution_id` BIGINT NOT NULL COMMENT 'ジョブ実行ID',
  `short_context` VARCHAR(2500) NOT NULL COMMENT 'ショートコンテクスト',
  `serialized_context` TEXT  COMMENT 'シリアライズドコンテクスト'
  ,PRIMARY KEY (`job_execution_id`)
) COMMENT='バッチジョブ実行状況';

CREATE TABLE `batch_job_import_error_deital` (
  `job_execution_id` BIGINT NOT NULL COMMENT 'ジョブ実行ID',
  `job_execution_detail_id` VARCHAR(30) NOT NULL COMMENT '明細ID',
  `line_number` BIGINT  COMMENT '行数',
  `error_message` VARCHAR(2500)  COMMENT 'エラーメッセージ'
  ,PRIMARY KEY (`job_execution_id`, `job_execution_detail_id`)
) COMMENT='バッチジョブ取込エラー明細';

CREATE TABLE `endpoint_authority_mapping` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'id',
  `url` VARCHAR(100) NOT NULL COMMENT 'url',
  `method` VARCHAR(6) NOT NULL COMMENT 'メソッド',
  `menu_function_id` BIGINT NOT NULL COMMENT 'メニュ機能ID',
  `authority_category` VARCHAR(3) NOT NULL COMMENT '権限区分'
  ,PRIMARY KEY (`id`)
) COMMENT='エンドポイント権限マッピング';

CREATE TABLE `report_master` (
  `report_id` VARCHAR(50) NOT NULL COMMENT 'レポートID',
  `report_name` VARCHAR(100) NOT NULL COMMENT 'レポート名',
  `template_file` VARCHAR(255) NOT NULL COMMENT 'テンプレートファイル',
  `permission_level` INTEGER NOT NULL COMMENT '権限レベル',
  `output_format` INTEGER NOT NULL COMMENT '出力形式',
  `description` VARCHAR(500)  COMMENT '説明',
  `updated_at` DATETIME NOT NULL COMMENT '更新日時',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '更新者ID'
  ,PRIMARY KEY (`report_id`)
) COMMENT='帳票マスタ';

CREATE TABLE `report_layout` (
  `report_id` VARCHAR(50) NOT NULL COMMENT '帳票ID',
  `column_id` VARCHAR(50) NOT NULL COMMENT 'カラムID',
  `sheet_index` INTEGER NOT NULL COMMENT 'シートインデックス',
  `entity_name` VARCHAR(100)  COMMENT 'エンティティ名',
  `property_path` VARCHAR(100)  COMMENT 'プロパティ名',
  `display_label` VARCHAR(100)  COMMENT '表示ラベル',
  `data_type` INTEGER  COMMENT 'データ型',
  `display_order` INTEGER  COMMENT '表示順',
  `visible_flag` INTEGER  COMMENT '表示フラグ',
  `format_pattern` VARCHAR(50)  COMMENT 'フォーマット形式',
  `required_flag` INTEGER  COMMENT '必須フラグ',
  `default_value` VARCHAR(100)  COMMENT 'デフォルト値',
  `remarks` VARCHAR(255)  COMMENT '備考',
  `updated_at` DATETIME  COMMENT '更新日時',
  `updated_by` VARCHAR(50)  COMMENT '更新者ID'
  ,PRIMARY KEY (`report_id`, `column_id`, `sheet_index`)
) COMMENT='帳票レイアウト';

CREATE TABLE `settings` (
  `item` VARCHAR(100) NOT NULL COMMENT '設定項目',
  `type` VARCHAR(50) NOT NULL COMMENT 'データ型',
  `val` VARCHAR(255) NOT NULL COMMENT '設定値'
  ,PRIMARY KEY (`item`)
) COMMENT='バックエンド設定';


CREATE TABLE `mail_templates` (
  `locale` VARCHAR(10) NOT NULL COMMENT 'ロケール',
  `template_name` VARCHAR(100) NOT NULL COMMENT 'テンプレート名',
  `subject` VARCHAR(255) NOT NULL COMMENT '件名',
  `body` TEXT NOT NULL COMMENT '本文'
  ,PRIMARY KEY (`locale`, `template_name`)
) COMMENT='メールテンプレート';

CREATE TABLE `error_codes` (
  `code` VARCHAR(20) NOT NULL COMMENT 'エラーコード',
  `locale` VARCHAR(10) NOT NULL COMMENT 'ロケール',
  `message` VARCHAR(255) NOT NULL COMMENT 'メッセージ内容'
  ,PRIMARY KEY (`code`, `locale`)
) COMMENT='エラーコード';

CREATE TABLE `notify_queue` (
  `id` BIGINT NOT NULL COMMENT '通知キューID',
  `event_type` VARCHAR(50) NOT NULL COMMENT 'イベント種別',
  `ref_id` BIGINT  COMMENT '参照ID',
  `notified` TINYINT(1)  COMMENT '通知済みフラグ',
  `retry_count` INTEGER  COMMENT 'リトライ回数',
  `created_at` DATETIME  COMMENT '作成日時',
  `last_attempted_at` DATETIME  COMMENT '最終試行日時'
  ,PRIMARY KEY (`id`)
) COMMENT='通知キュー';

CREATE TABLE `job_status` (
  `id` BIGINT NOT NULL COMMENT 'ID',
  `job_name` VARCHAR(255)  COMMENT 'ジョブ名',
  `job_type` INTEGER  COMMENT 'ジョブタイプ',
  `status` VARCHAR(255)  COMMENT 'ステータス',
  `start_time` DATETIME  COMMENT '処理開始時間',
  `end_time` DATETIME  COMMENT '処理終了時間',
  `message` VARCHAR(255)  COMMENT 'メッセージ',
  `original_file_name` VARCHAR(255)  COMMENT '元ファイル名'
  ,PRIMARY KEY (`id`)
) COMMENT='ジョブステータス';


CREATE TABLE `master_menu_function` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'id',
  `function_category` VARCHAR(3) NOT NULL COMMENT '機能カテゴリ',
  `display_order` VARCHAR(2) NOT NULL COMMENT '表示順',
  `menu_name` VARCHAR(20)  COMMENT 'メニュー名',
  `url` VARCHAR(100)  COMMENT 'url',
  `updated_flag` TINYINT(1)  COMMENT '更新有フラグ',
  `approval_flag` TINYINT(1)  COMMENT '承認有フラグ'
  ,PRIMARY KEY (`id`)
  ,UNIQUE (`function_category`, `display_order`)
) COMMENT='メニュ機能マスタ';

CREATE TABLE `notice` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'id',
  `title` VARCHAR(20)  COMMENT 'タイトル',
  `display_start_date` DATE  COMMENT '表示期間開始日',
  `display_end_date` DATE  COMMENT 'CD',
  `content` VARCHAR(250)  COMMENT '内容',
  `deleted_flag` TINYINT(1)  COMMENT '削除済フラグ',
  `creator_user_id` VARCHAR(100) NOT NULL COMMENT '作成者ユーザID',
  `created_date_and_time` DATETIME NOT NULL COMMENT '作成日時',
  `updater_user_id` VARCHAR(100) NOT NULL COMMENT '更新者ユーザID',
  `updated_date_and_time` DATETIME NOT NULL COMMENT '更新日時'
  ,PRIMARY KEY (`id`)
) COMMENT='お知らせ';

CREATE TABLE `file` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'id',
  `identification_id` VARCHAR(14) NOT NULL COMMENT '識別ID',
  `file_name` VARCHAR(50)  COMMENT 'ファイル名',
  `destination_url` VARCHAR(100)  COMMENT '保存先URL',
  `file_size` DECIMAL(10,3)  COMMENT 'ファイルサイズ',
  `file_format` VARCHAR(20)  COMMENT 'ファイル形式',
  `deleted_flag` TINYINT(1)  COMMENT '削除済フラグ',
  `creator_user_id` VARCHAR(100) NOT NULL COMMENT '作成者ユーザID',
  `created_date_and_time` DATETIME NOT NULL COMMENT '作成日時',
  `updater_user_id` VARCHAR(100) NOT NULL COMMENT '更新者ユーザID',
  `updated_date_and_time` DATETIME NOT NULL COMMENT '更新日時'
  ,PRIMARY KEY (`id`)
) COMMENT='ファイル';

CREATE TABLE `system_setting` (
    `id` VARCHAR(45) NOT NULL COMMENT 'id',
    `company_name` VARCHAR(20)  COMMENT '会社名',
    `password_validity_days` INTEGER  COMMENT 'パスワード期限日数',
    `password_attempt_validity_count` INTEGER  COMMENT 'パスワード試行回数上限',
    `password_reissue_url_expiration_date` INTEGER  COMMENT 'パスワード再発行URL有効期限',
    `number_of_days_available_for_reservation` INTEGER  COMMENT '予約可能日数',
    `number_of_retries` INTEGER  COMMENT 'ログイン試行回数上限',
    `number_of_notices` INTEGER  COMMENT 'お知らせ表示件数',
    `creator_user_id` VARCHAR(100) NOT NULL COMMENT '作成者ユーザID',
    `created_date_and_time` DATETIME NOT NULL COMMENT '作成日時',
    `updater_user_id` VARCHAR(100) NOT NULL COMMENT '更新者ユーザID',
    `updated_date_and_time` DATETIME NOT NULL COMMENT '更新日時'
  ,PRIMARY KEY (`id`)
) COMMENT='システム設定';


CREATE TABLE `master_screen_id` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'id',
  `menu_function_id` BIGINT NOT NULL COMMENT 'メニュ機能ID',
  `screen_id` VARCHAR(7) NOT NULL COMMENT '画面ID',
  `screen_name` VARCHAR(20)  COMMENT '画面名',
  `screen_category` VARCHAR(3)  COMMENT '画面区分'
  ,PRIMARY KEY (`id`)
  ,UNIQUE (`screen_id`)
) COMMENT='画面IDマスタ';



CREATE TABLE `master_message` (
  `message_id` VARCHAR(4) NOT NULL COMMENT 'メッセージID',
  `message_category` VARCHAR(3) NOT NULL COMMENT 'メッセージ区分',
  `fb_category` VARCHAR(2)  COMMENT 'FB区分',
  `contents` VARCHAR(500) NOT NULL COMMENT '内容',
  `notes` VARCHAR(500)  COMMENT '備考'
  ,PRIMARY KEY (`message_id`)
) COMMENT='メッセージマスタ';

CREATE TABLE `master_user` (
  `id` VARCHAR(14) NOT NULL COMMENT 'id',
  `user_id` VARCHAR(100) NOT NULL COMMENT 'ユーザID',
  `organization_id` BIGINT NOT NULL COMMENT '組織ID',
  `name` VARCHAR(20)  COMMENT '氏名',
  `job_category` VARCHAR(3)  COMMENT '職位区分',
  `telephone_number_1` VARCHAR(11)  COMMENT '電話番号1',
  `telephone_number_2` VARCHAR(11)  COMMENT '電話番号2',
  `role_id` BIGINT  COMMENT 'ロールID',
  `password` VARCHAR(100)  COMMENT 'パスワード',
  `password_set_date` DATETIME  COMMENT 'パスワード設定日',
  `deleted_flag` TINYINT(1)  COMMENT '削除済フラグ',
  `reason_for_deletion` VARCHAR(100)  COMMENT '削除理由',
  `creator_user_id` VARCHAR(100) NOT NULL COMMENT '作成者ユーザID',
  `created_date_and_time` DATETIME NOT NULL COMMENT '作成日時',
  `updater_user_id` VARCHAR(100) NOT NULL COMMENT '更新者ユーザID',
  `updated_date_and_time` DATETIME NOT NULL COMMENT '更新日時'
  ,PRIMARY KEY (`id`)
  ,UNIQUE (`id`, `user_id`)
) COMMENT='ユーザマスタ';


-- インデックスの追加
CREATE INDEX idx_master_role_unique_id ON `master_role` (`unique_id`);
CREATE INDEX idx_master_user_user_id ON `master_user` (`user_id`);

-- 外部キー制約の追加
ALTER TABLE `manual` ADD FOREIGN KEY (`creator_user_id`) REFERENCES `master_user`(`user_id`);
ALTER TABLE `manual` ADD FOREIGN KEY (`updater_user_id`) REFERENCES `master_user`(`user_id`);
ALTER TABLE `manual_file` ADD FOREIGN KEY (`manual_id`) REFERENCES `manual`(`id`);
ALTER TABLE `manual_file` ADD FOREIGN KEY (`creator_user_id`) REFERENCES `master_user`(`user_id`);
ALTER TABLE `manual_file` ADD FOREIGN KEY (`updater_user_id`) REFERENCES `master_user`(`user_id`);
ALTER TABLE `master_role_operation_function` ADD FOREIGN KEY (`role_id`) REFERENCES `master_role`(`id`);
ALTER TABLE `master_role_operation_function` ADD FOREIGN KEY (`role_unique_id`) REFERENCES `master_role`(`unique_id`);
ALTER TABLE `master_role_operation_function` ADD FOREIGN KEY (`menu_function_id`) REFERENCES `master_menu_function`(`id`);
ALTER TABLE `batch_job_execution` ADD FOREIGN KEY (`job_instance_id`) REFERENCES `batch_job_instance`(`job_instance_id`);
ALTER TABLE `batch_job_execution_params` ADD FOREIGN KEY (`job_execution_id`) REFERENCES `batch_job_execution`(`job_execution_id`);
ALTER TABLE `batch_step_execution` ADD FOREIGN KEY (`job_execution_id`) REFERENCES `batch_job_execution`(`job_execution_id`);
ALTER TABLE `batch_step_execution_context` ADD FOREIGN KEY (`step_execution_id`) REFERENCES `batch_step_execution`(`step_execution_id`);
ALTER TABLE `batch_job_execution_context` ADD FOREIGN KEY (`job_execution_id`) REFERENCES `batch_job_execution`(`job_execution_id`);
ALTER TABLE `batch_job_import_error_deital` ADD FOREIGN KEY (`job_execution_id`) REFERENCES `batch_job_execution`(`job_execution_id`);
ALTER TABLE `notice` ADD FOREIGN KEY (`creator_user_id`) REFERENCES `master_user`(`user_id`);
ALTER TABLE `notice` ADD FOREIGN KEY (`updater_user_id`) REFERENCES `master_user`(`user_id`);
ALTER TABLE `file` ADD FOREIGN KEY (`creator_user_id`) REFERENCES `master_user`(`user_id`);
ALTER TABLE `file` ADD FOREIGN KEY (`updater_user_id`) REFERENCES `master_user`(`user_id`);

ALTER TABLE `master_screen_id` ADD FOREIGN KEY (`menu_function_id`) REFERENCES `master_menu_function`(`id`);

-- =====================================================
-- PATCH: tables/columns required by backend code
-- =====================================================

-- Align endpoint_authority_mapping for required_level (used by PermissionConfigProvider)
ALTER TABLE endpoint_authority_mapping
  ADD COLUMN required_level INT NULL AFTER menu_function_id;

-- Align report_master/report_layout types for JPA entities
ALTER TABLE report_master
  MODIFY report_id BIGINT NOT NULL,
  MODIFY permission_level INTEGER NULL;

ALTER TABLE report_layout
  DROP PRIMARY KEY,
  DROP COLUMN sheet_index,
  MODIFY report_id BIGINT NOT NULL,
  MODIFY column_id INT NOT NULL,
  ADD COLUMN column_name VARCHAR(100) NULL AFTER column_id,
  ADD PRIMARY KEY (report_id, column_id);

-- Users (Auth / Security)
CREATE TABLE IF NOT EXISTS users (
  user_id CHAR(36) NOT NULL,
  password VARCHAR(255) NOT NULL,
  given_name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  mobile_no VARCHAR(30),
  email VARCHAR(254),
  role_id INT NOT NULL,
  password_set_time DATETIME,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  is_locked_out TINYINT(1) NOT NULL DEFAULT 0,
  lock_out_time DATETIME,
  latest_login_time DATETIME,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  deletion_reason TEXT,
  creator_user_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  editor_user_id CHAR(36) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
) COMMENT='users';

CREATE TABLE IF NOT EXISTS user_role_permissions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  permission_level INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) COMMENT='user role permissions';

CREATE TABLE IF NOT EXISTS user_detail (
  user_id BIGINT NOT NULL,
  phone_number VARCHAR(255),
  kana_name VARCHAR(255),
  address VARCHAR(255),
  PRIMARY KEY (user_id)
) COMMENT='user detail';

-- Session exclusion endpoints
-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  issued_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked TINYINT(1) NOT NULL DEFAULT 0,
  used TINYINT(1) NOT NULL DEFAULT 0,
  family_id CHAR(36) NOT NULL,
  parent_jti CHAR(36),
  jti CHAR(36) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_tokens_jti (jti)
) COMMENT='refresh tokens';

-- Test/support tables used by code
CREATE TABLE IF NOT EXISTS test_pk_user (
  id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  PRIMARY KEY (id)
) COMMENT='test pk user';

CREATE TABLE IF NOT EXISTS user_test (
  user_id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255),
  PRIMARY KEY (user_id)
) COMMENT='user test';

CREATE TABLE IF NOT EXISTS `order` (
  order_id INT NOT NULL,
  product_name VARCHAR(255),
  quantity INT,
  price DECIMAL(10,2),
  order_date DATE,
  PRIMARY KEY (order_id)
) COMMENT='orders';

-- Spring Session JDBC (required when spring.session.store-type=jdbc)
CREATE TABLE IF NOT EXISTS spring_session (
  primary_id CHAR(36) NOT NULL,
  session_id CHAR(36) NOT NULL,
  creation_time BIGINT NOT NULL,
  last_access_time BIGINT NOT NULL,
  max_inactive_interval INT NOT NULL,
  expiry_time BIGINT NOT NULL,
  principal_name VARCHAR(100),
  PRIMARY KEY (primary_id),
  UNIQUE KEY spring_session_ix1 (session_id),
  KEY spring_session_ix2 (expiry_time),
  KEY spring_session_ix3 (principal_name)
) COMMENT='spring session';

CREATE TABLE IF NOT EXISTS spring_session_attributes (
  session_primary_id CHAR(36) NOT NULL,
  attribute_name VARCHAR(200) NOT NULL,
  attribute_bytes BLOB NOT NULL,
  PRIMARY KEY (session_primary_id, attribute_name),
  CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id)
    REFERENCES spring_session(primary_id) ON DELETE CASCADE
) COMMENT='spring session attributes';

-- Spring Batch sequences (required by schema-mysql.sql)
CREATE TABLE IF NOT EXISTS BATCH_STEP_EXECUTION_SEQ (
  ID BIGINT NOT NULL,
  UNIQUE_KEY CHAR(1) NOT NULL,
  CONSTRAINT BATCH_STEP_EXECUTION_SEQ_UK UNIQUE (UNIQUE_KEY)
);

CREATE TABLE IF NOT EXISTS BATCH_JOB_EXECUTION_SEQ (
  ID BIGINT NOT NULL,
  UNIQUE_KEY CHAR(1) NOT NULL,
  CONSTRAINT BATCH_JOB_EXECUTION_SEQ_UK UNIQUE (UNIQUE_KEY)
);

CREATE TABLE IF NOT EXISTS BATCH_JOB_SEQ (
  ID BIGINT NOT NULL,
  UNIQUE_KEY CHAR(1) NOT NULL,
  CONSTRAINT BATCH_JOB_SEQ_UK UNIQUE (UNIQUE_KEY)
);
