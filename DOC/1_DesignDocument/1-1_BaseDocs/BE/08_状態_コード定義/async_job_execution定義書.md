# async_job_execution定義書

## 1. 目的
非同期ジョブ状態と成果物参照情報を永続化する。

## 2. テーブル概要
- テーブル名: `async_job_execution`
- 作成migration: `BE/servercommon/src/main/resources/db/migration/V7__async_job_execution.sql`

## 3. カラム定義

| カラム名 | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| `id` | BIGINT | PK, AUTO_INCREMENT | 識別子 |
| `job_name` | VARCHAR(255) | UNIQUE, NOT NULL | ジョブ名 |
| `job_type` | VARCHAR(100) | NOT NULL | ジョブ種別 |
| `status` | VARCHAR(20) | NOT NULL | `PENDING/RUNNING/COMPLETED/FAILED/EXPIRED` |
| `artifact_path` | VARCHAR(500) | NULL | 成果物パス |
| `artifact_mime_type` | VARCHAR(255) | NULL | MIME Type |
| `error_message` | VARCHAR(1000) | NULL | 失敗理由 |
| `started_at` | DATETIME(6) | NULL | 開始日時 |
| `ended_at` | DATETIME(6) | NULL | 終了日時 |
| `expires_at` | DATETIME(6) | NOT NULL | 期限日時 |
| `created_at` | DATETIME(6) | NOT NULL | 作成日時 |
| `updated_at` | DATETIME(6) | NOT NULL | 更新日時 |

## 4. インデックス
- `uk_async_job_execution_job_name` (`job_name`)
- `idx_async_job_execution_expires_at` (`expires_at`)
- `idx_async_job_execution_status` (`status`)

## 5. 運用
- ポーリングは `job_name` 一意検索で状態を参照する。
- TTL掃除は `COMPLETED/FAILED` のみ対象とする。
- 期限到達後は成果物削除 + `EXPIRED` 更新を行う。
