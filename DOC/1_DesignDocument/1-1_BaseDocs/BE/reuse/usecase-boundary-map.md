# usecase-boundary-map

## 目的
個別機能ごとの責務境界を再利用判断用に整理する。

## 1. 帳票出力API

- 機能名: 帳票出力API
- 境界:
  - Controller: `ReportController`
  - UseCase: `ReportTypeJudge`, `ReportPollingRunner`, `ReportService`
  - Domain: `ReportMaster`, `ReportLayout`, `AsyncJobExecution`
  - Repository: `ReportMasterRepository`, `ReportLayoutRepository`, `AsyncJobExecutionRepository`
  - External: `StorageService`（S3/Local）
- 主状態: `async_job_execution`
- 互換状態: `job_status`

## 2. ファイル取込API

- 機能名: ファイル取込API
- 境界:
  - Controller: `FileImportController`
  - UseCase: `InternalApiClient`（batch起動）, `ReportPollingRunner`（downloadReady）
  - Domain: `JobStatus`, `AsyncJobExecution`
  - Repository: `JobStatusRepository`, `AsyncJobExecutionRepository`
  - External: `StorageService`, batchserver
- 主状態:
  - 取込履歴: `job_status`
  - ダウンロード準備: `async_job_execution`

## 3. 外部連携（sync）

- 機能名: HMAC署名付きsync連携
- 境界:
  - UseCase: Outbox送信サービス
  - External: `SignedRestTemplate`, `SyncSignatureVerificationInterceptor`
- 導入条件: `sync.outbox.use=true`
- 非導入条件: `sync.outbox.use=false` のシステムは依存未導入可

## 4. 通知再送制御（notify_queue）

- 機能名: WebSocket通知再送制御
- 境界:
  - Controller: `NotifyQueueController`
  - UseCase: `NotifyQueuePublisher`, `NotifyQueueScanService`, `WebSocketNotificationService`
  - Domain: `NotifyQueue`, `NotifyQueueStatus`, `NotifyEventType`
  - Repository: `NotifyQueueRepository`
  - External: WebSocket STOMP (`/topic/notify/*`)
- 主状態: `notify_queue.status`
- 補助状態: `notified`（後方互換）

## 5. 動的設定解決（system_setting）

- 機能名: 動的設定解決基盤
- 境界:
  - Controller: `SystemSettingController`
  - UseCase: `SystemSettingService`, `SystemSettingResolver`, `SystemSettingHistoryService`
  - Domain: `SystemSetting`, `SystemSettingHistory`
  - Repository: `SystemSettingRepository`, `SystemSettingHistoryRepository`
  - External: なし（DB内完結）
- 主状態: `system_setting`（単一レコード運用）
- 監査状態: `system_setting_history`
- 補助状態: `SystemSettingCache`（`system.setting.cache.*`）
