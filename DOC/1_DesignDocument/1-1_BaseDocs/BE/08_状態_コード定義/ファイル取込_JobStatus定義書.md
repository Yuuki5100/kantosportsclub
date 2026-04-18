# ファイル取込_JobStatus定義書

## 1. 目的
ファイル取込で利用する既存 `job_status` の定義と、非同期状態テーブルとの役割を整理する。

## 2. `job_status` の役割
- 取込履歴一覧（`/import/history`）で利用する既存履歴テーブル。
- 主な状態値: `RUNNING`, `SUCCESS`, `FAILED`

## 3. 主要項目
- `job_name`
- `job_type`
- `original_file_name`
- `status`
- `message`
- `start_time`
- `end_time`

## 4. 非同期状態管理との棲み分け
- 非同期ダウンロード制御の主状態は `async_job_execution`。
- `job_status` は既存利用者互換と履歴用途で継続利用する。
