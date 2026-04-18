# 非同期処理設計書（バックエンド編）

## 1. 目的
非同期処理の実行方式と状態管理方式を統一し、再起動後も状態参照できる構成を維持する。

## 2. 分類方針

| 分類 | 実行主体 | 典型処理 | 状態管理 |
| --- | --- | --- | --- |
| 軽量非同期 | `appserver` (`@Async`) | 一時処理・副作用の小さい通知 | ログ中心（永続化不要） |
| 中量非同期 | `appserver` Runner / Scheduler | 帳票生成、notify_queue通知再送 | DB永続化（`async_job_execution` / `notify_queue`） |
| 重量バッチ | `batchserver` | ファイル取込・定期バッチ | バッチ基盤テーブル + 業務テーブル |

## 3. 中量非同期の標準構成（実装反映）

### 3-1. 帳票ジョブ系
- `ReportTypeJudge`: `jobName` 発行、`AsyncJobStatusService.registerPending(...)`。
- `ReportPollingRunner`: 実処理実行、`RUNNING/COMPLETED/FAILED` 更新。
- `AsyncJobStatusService` (`servercommon`): `async_job_execution` 永続化。
- `AsyncJobArtifactService` (`servercommon`): `StorageService` への成果物保存/再取得/削除。
- `AsyncJobCleanupService` (`appserver`): TTL切れジョブの成果物削除と `EXPIRED` 化。

### 3-2. 通知再送系（notify_queue）
- `NotifyQueuePublisherImpl`: 通知イベントを `notify_queue` に `PENDING` で登録。
- `NotifyQueueScanService`: `PENDING/RETRY_WAIT` をスキャンし送信実行。
- `WebSocketNotificationService`: `/topic/notify/{eventType}` へ送信。
- `NotifyQueueCleanupService`: `SENT` かつ保管期限超過を削除。

### 3-3. 状態遷移
- 帳票ジョブ: `PENDING -> RUNNING -> COMPLETED | FAILED -> EXPIRED`
- 通知再送: `PENDING -> SENT`、失敗時 `PENDING/RETRY_WAIT -> RETRY_WAIT -> FAILED`

## 4. 再起動耐性
- 帳票ジョブ状態は `async_job_execution` に保存するため、`appserver` 再起動後も `jobName` で参照可能。
- 通知再送状態は `notify_queue`（`status`, `retry_count`, `next_attempt_at`）に保存するため、再起動後も再送継続可能。
- 成果物は `artifact_path` を通じ `StorageService.getFileByPath(...)` で再取得する。

## 5. 設定値（`application.yml`）

### 5-1. 帳票ジョブ
| key | 用途 | 既定値 |
| --- | --- | --- |
| `async.job.status-ttl-minutes` | 保持期限（分） | `60` |
| `async.job.cleanup-fixed-delay-ms` | 期限切れ掃除の周期 | `600000` |
| `async.job.cleanup-batch-size` | 1回の掃除件数 | `100` |
| `async.job.artifact-prefix` | 成果物保存プレフィックス | `async-jobs` |

### 5-2. 通知再送
| key | 用途 | 既定値 |
| --- | --- | --- |
| `notify.queue.scan.limit` | 1回の走査件数 | `100` |
| `notify.queue.scan.fixed-delay-ms` | スキャン周期（ms） | `10000000` |
| `notify.queue.scan.max-retry` | 再送上限 | `5` |
| `notify.queue.scan.backoff-initial-delay-ms` | 初回バックオフ（ms） | `1000` |
| `notify.queue.scan.backoff-multiplier` | バックオフ倍率 | `2.0` |
| `notify.queue.scan.backoff-max-delay-ms` | バックオフ上限（ms） | `60000` |

## 6. トランザクション境界
- `AsyncJobStatusService` の状態更新はメソッド単位で `@Transactional`。
- `NotifyQueueScanService` は1キュー単位で送信試行し、結果状態を同一処理内で保存する。
- 成果物保存 (`StorageService`) とDB更新は同一分散Txにしていない。
- 整合性は「失敗時に成果物を削除し、状態をFAILEDへ更新」で担保する。

## 7. 運用ルール
- 新規非同期処理はメモリキャッシュ単独管理を禁止する。
- ポーリングAPIは `async_job_execution` を主、既存互換のため `job_status` を副で参照する。
- 通知再送は `notify_queue.status` を正とし、`notified` だけで制御しない。
- TTL掃除は必須。削除失敗時は処理継続し WARN ログを残す。
