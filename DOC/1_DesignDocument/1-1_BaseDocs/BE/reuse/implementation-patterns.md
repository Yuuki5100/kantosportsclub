# 実装パターン集（バックエンド / 既存資産再利用判断用）

## 1. 永続化付き非同期ジョブ（推奨パターン）

### 構成
1. 起動APIで `jobName` 発行
2. `AsyncJobStatusService.registerPending(...)`
3. 非同期Runnerで `markRunning(...)`
4. 成果物保存 (`AsyncJobArtifactService.save(...)`)
5. 成功: `markCompleted(...)` / 失敗: `markFailed(...)`
6. ポーリングAPIで状態参照
7. 定期掃除で `EXPIRED` 化

### 再利用ポイント
- 状態は `async_job_execution` を正とする。
- 成果物は `artifact_path` を保持し再取得可能にする。
- 既存互換が必要な場合のみ `job_status` 参照を残す。

## 2. 互換維持パターン
- API契約は維持し内部実装のみ置換する。
- 例: `downloadReady/download` はエンドポイントを維持し、内部をストレージ再取得に変更。

## 3. 任意導入外部連携パターン（sync）
- 機能フラグ: `sync.outbox.use`
- `true`: `SignedRestTemplate` 経由で送信
- `false`: 送信機能を起動せず依存を持ち込まない

## 4. トランザクション境界パターン
- DB状態更新は `AsyncJobStatusService` でトランザクション管理。
- ストレージI/Oは分離し、失敗時補償（削除 + FAILED更新）で整合を保つ。

## 5. notify_queue再送制御パターン（推奨）

### 構成
1. `NotifyQueuePublisher` で `PENDING` 登録（`retryCount=0`, `maxRetry` 設定）
2. `NotifyQueueScanService` で `PENDING/RETRY_WAIT` を抽出
3. `WebSocketNotificationService` で送信
4. 成功: `SENT`
5. 失敗（上限未達）: `RETRY_WAIT` + `nextAttemptAt` 設定
6. 失敗（上限到達）: `FAILED`

### 再利用ポイント
- 再送判定は `status` と `nextAttemptAt` を利用する。
- バックオフは `notify.queue.scan.backoff-*` で外出しする。
- `lastErrorMessage` を保持し、失敗原因を監査可能にする。

## 6. 動的設定解決パターン（推奨）

### 構成
1. 取得側は `SystemSettingResolver` の型付きAPIを使用
2. `SystemSettingCache` でキー単位キャッシュ参照
3. キャッシュミス時のみ `system_setting(id=1)` を参照
4. 更新API (`SystemSettingService.upsert`) で設定更新
5. `SystemSettingHistoryService` で差分履歴保存
6. 更新完了後に `SystemSettingResolver.evictAll()` を実行

### 再利用ポイント
- 業務可変設定は `SystemSettingRepository` を直接参照せず、Resolver経由に統一する。
- キー管理は `SystemSettingKeys` に集約し、文字列直書きを避ける。
- 設定更新と履歴保存は同一トランザクションで扱う。
