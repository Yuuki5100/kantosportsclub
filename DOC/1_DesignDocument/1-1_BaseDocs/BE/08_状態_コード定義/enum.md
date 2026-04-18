# Enum設計書（バックエンド編）

## 1. 目的
業務コード・ステータス・権限をEnumで統一し、判定ロジックの分散を防ぐ。

## 2. 適用範囲
- 対象モジュール: `servercommon`
- 対象パッケージ: `com.example.servercommon.enums` / `com.example.servercommon.model`

## 3. Enum一覧（主要）
- `AsyncJobExecutionStatus`
- `NotifyQueueStatus`
- `NotifyEventType`
- `BatchInfo`
- `ClosureStatus`
- `FileJobImportCellType`
- `JobType`
- `PermissionLevelType`
- `ProcessCategory`
- `RegistartionStatus`
- `ReportDataType`
- `ResourceType`
- `StatusType`
- `UserRoleLevel`
- `UserRole`（model配下）

## 4. 認可関連コード

### `UserRole`
- `SYSTEM_ADMIN(1)`
- `EDITOR(2)`
- `VIEWER(3)`
- `CUSTOM(4)`

### `PermissionLevelType`
- `Custom(0)`
- `USER(1)`
- `ADMIN(2)`
- `VIEWER(3)`

## 5. 非同期ジョブ状態

### `AsyncJobExecutionStatus`
- `PENDING`: 受付済み
- `RUNNING`: 実行中
- `COMPLETED`: 正常完了
- `FAILED`: 異常終了
- `EXPIRED`: 期限切れで掃除済み

## 6. 通知再送状態

### `NotifyQueueStatus`
- `PENDING`: 登録済み、未送信
- `RETRY_WAIT`: 失敗後待機中（`next_attempt_at` 未到達）
- `SENT`: 送信完了
- `FAILED`: 再送上限到達の永久失敗

### `NotifyEventType`
- `FILE_DOWNLOAD_COMPLETED`
- `GATE_IN`
- `GATE_OUT`
- `REPORT_READY`

運用ルール:
- eventType の新規追加は `NotifyEventType` へ追記し、利用箇所の文字列直書きを避ける。
- 未知eventTypeは送信処理上は互換維持のため許容し、WARNログで検知する。

## 7. 既存互換
- `job_status.status`（`RUNNING/SUCCESS/FAILED`）は互換用途で併用する。
- 新規実装では `AsyncJobExecutionStatus` を優先する。
- 通知は `notified` 互換フラグを残しつつ、`NotifyQueueStatus` を正として扱う。
