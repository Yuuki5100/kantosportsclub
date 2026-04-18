# BE 再利用性判断用 依存関係マップ

## 目的
再利用判断に必要な依存関係（DB/ストレージ/外部連携/設定）を整理する。

## 1. 非同期ジョブ永続化

| 依存元 | 依存先 | 依存理由 | 強度 |
| --- | --- | --- | --- |
| `ReportTypeJudge` | `AsyncJobStatusService` | `PENDING` 登録 | 強 |
| `ReportPollingRunner` | `AsyncJobStatusService` | `RUNNING/COMPLETED/FAILED` 更新 | 強 |
| `ReportPollingRunner` | `AsyncJobArtifactService` | 成果物保存/削除 | 強 |
| `AsyncJobArtifactService` | `StorageService` | 成果物I/O | 強 |
| `AsyncJobStatusService` | `AsyncJobExecutionRepository` | 状態永続化 | 強 |
| `AsyncJobCleanupService` | `AsyncJobStatusService` | 期限切れ状態更新 | 強 |
| `AsyncJobCleanupService` | `AsyncJobArtifactService` | 期限切れ成果物削除 | 強 |

## 2. 互換レイヤ

| 依存元 | 依存先 | 依存理由 | 強度 |
| --- | --- | --- | --- |
| `ReportController` | `JobStatusRepository` | 旧データ互換参照 | 任意 |
| `FileImportController` | `JobStatusRepository` | 履歴一覧API | 強 |

## 3. 通知再送制御（notify_queue）

| 依存元 | 依存先 | 依存理由 | 強度 |
| --- | --- | --- | --- |
| `ReportPollingRunner` | `NotifyQueuePublisher` | 完了通知キュー登録 | 強 |
| `NotifyQueuePublisherImpl` | `NotifyQueueRepository` | 通知キューINSERT | 強 |
| `NotifyQueuePublisherImpl` | `NotifyQueueScanProperties` | `maxRetry` 初期化 | 強 |
| `NotifyQueueScanService` | `NotifyQueueRepository` | 送信対象抽出・状態更新 | 強 |
| `NotifyQueueScanService` | `WebSocketNotificationService` | STOMP送信 | 強 |
| `WebSocketNotificationService` | `SimpMessagingTemplate` | topic送信 | 強 |

## 4. 設定依存

| 設定キー | 参照先 | 用途 |
| --- | --- | --- |
| `async.job.status-ttl-minutes` | `ReportTypeJudge`, `ReportPollingRunner` | 期限設定 |
| `async.job.cleanup-fixed-delay-ms` | `AsyncJobCleanupService` | 掃除周期 |
| `async.job.cleanup-batch-size` | `AsyncJobCleanupService` | 掃除件数 |
| `async.job.artifact-prefix` | `ReportPollingRunner` | 保存先プレフィックス |
| `notify.queue.scan.limit` | `NotifyQueueScanService` | 1回の送信対象件数 |
| `notify.queue.scan.fixed-delay-ms` | `NotifyQueueScanService` | スキャン周期 |
| `notify.queue.scan.max-retry` | `NotifyQueuePublisherImpl`, `NotifyQueueScanService` | 再送上限 |
| `notify.queue.scan.backoff-initial-delay-ms` | `NotifyQueueScanService` | 初期待機 |
| `notify.queue.scan.backoff-multiplier` | `NotifyQueueScanService` | バックオフ倍率 |
| `notify.queue.scan.backoff-max-delay-ms` | `NotifyQueueScanService` | 待機上限 |
| `system.setting.cache.enabled` | `SystemSettingCacheProperties` | 動的設定キャッシュ有効/無効 |
| `system.setting.cache.ttl-seconds` | `SystemSettingCache` | 動的設定キャッシュTTL |
| `system.setting.cache.max-entries` | `SystemSettingCache` | 動的設定キャッシュ最大件数 |
| `sync.outbox.use` | sync送信利用コード | 任意導入トグル |

## 5. 外部連携依存（sync）

| 依存元 | 依存先 | 導入条件 |
| --- | --- | --- |
| `SyncOutboxDispatchService` 等 | `SignedRestTemplate` | `sync.outbox.use=true` |
| 受信API | `SyncSignatureVerificationInterceptor` | 受信署名検証を行う場合 |

ルール:
- `sync.outbox.use=false` で常時有効な依存注入を作らない。
- 通知再送は `status` と `next_attempt_at` の両方を満たすデータのみ送信対象にする。

## 6. 動的設定解決（system_setting）

| 依存元 | 依存先 | 依存理由 | 強度 |
| --- | --- | --- | --- |
| `NoticeService` | `SystemSettingResolver` | お知らせ表示件数の動的取得 | 強 |
| `SystemSettingService` | `SystemSettingRepository` | 設定更新/作成 | 強 |
| `SystemSettingService` | `SystemSettingHistoryService` | 差分履歴保存 | 強 |
| `SystemSettingService` | `SystemSettingResolver` | 更新後キャッシュ無効化 | 強 |
| `DatabaseSystemSettingResolver` | `SystemSettingCache` | 設定値キャッシュ | 強 |
| `DatabaseSystemSettingResolver` | `SystemSettingValueConverter` | 型変換 | 強 |

ルール:
- 業務可変設定の取得は `SystemSettingResolver` 経由に統一する。
- `system_setting` 更新時は `system_setting_history` 保存と `evictAll` をセットで実行する。
