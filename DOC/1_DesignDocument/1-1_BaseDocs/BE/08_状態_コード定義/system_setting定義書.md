# system_setting定義書

## 1. 目的
動的設定解決基盤で使用する `system_setting` / `system_setting_history` の定義を明確化する。

## 2. テーブル定義

### 2-1. system_setting
| カラム名 | 論理名 | データ型 | PK | NULL | 説明 |
| --- | --- | --- | --- | --- | --- |
| id | 設定レコードID | VARCHAR(45) | ○ | × | 単一レコード運用（`1`） |
| company_name | 会社名 | VARCHAR(20) |  | ○ | 既存互換項目 |
| password_validity_days | パスワード有効日数 | INT |  | ○ | 既存項目 |
| password_attempt_validity_count | パスワード試行回数上限 | INT |  | ○ | 既存項目 |
| password_reissue_url_expiration_date | 再発行URL有効期限 | INT |  | ○ | 既存項目 |
| number_of_days_available_for_reservation | 予約可能日数 | INT |  | ○ | 既存項目 |
| number_of_retries | 再試行回数 | INT |  | ○ | 既存項目 |
| number_of_notices | お知らせ表示件数 | INT |  | ○ | `NUMBER_OF_NOTICES` の正本 |
| creator_user_id | 作成者 | VARCHAR(100) |  | × | 作成ユーザID |
| created_date_and_time | 作成日時 | TIMESTAMP |  | × | UTC保存 |
| updater_user_id | 更新者 | VARCHAR(100) |  | × | 更新ユーザID |
| updated_date_and_time | 更新日時 | TIMESTAMP |  | × | UTC保存 |

### 2-2. system_setting_history
| カラム名 | 論理名 | データ型 | PK | NULL | 説明 |
| --- | --- | --- | --- | --- | --- |
| id | 履歴ID | BIGINT | ○ | × | 自動採番 |
| setting_id | 設定レコードID | VARCHAR(45) |  | × | `system_setting.id` |
| setting_key | 設定キー | VARCHAR(100) |  | × | `SystemSettingKeys` のキー |
| before_value | 変更前値 | VARCHAR(255) |  | ○ | 新規作成時は `null` |
| after_value | 変更後値 | VARCHAR(255) |  | ○ | |
| updated_by | 更新者 | VARCHAR(100) |  | × | 更新ユーザID |
| updated_date_and_time | 更新日時 | TIMESTAMP |  | × | UTC保存 |

## 3. インデックス
| インデックス名 | 対象カラム | 用途 |
| --- | --- | --- |
| idx_system_setting_history_setting_id_time | `(setting_id, updated_date_and_time)` | 設定単位の履歴時系列参照 |

## 4. 設定キー定義（実装正本）
- `COMPANY_NAME`
- `PASSWORD_VALID_DAYS`
- `PASSWORD_ATTEMPT_VALIDITY_COUNT`
- `PASSWORD_REISSUE_URL_EXPIRATION`
- `NUMBER_OF_DAYS_AVAILABLE_FOR_RESERVATION`
- `NUMBER_OF_RETRIES`
- `NUMBER_OF_NOTICES`
- 互換キー: `noticeDisplayLimit`

## 5. 関連migration
- `BE/servercommon/src/main/resources/db/migration/V9__system_setting_dynamic_resolver.sql`

## 6. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 1.0 | 2026/04/02 | 動的設定解決基盤向けに `system_setting_history` とキー定義を追加 |
