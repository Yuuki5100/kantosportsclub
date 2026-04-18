# glossary（再利用判定用 用語集）

## Async Job Execution
定義: 非同期ジョブの状態と成果物参照情報を保持する永続化モデル。
このPJでの意味: `async_job_execution` テーブルと `AsyncJobExecutionStatus`。
注意点: メモリキャッシュではなくDBを正とする。

## Artifact Path
定義: 非同期成果物の保存先パス。
このPJでの意味: `async_job_execution.artifact_path`。
注意点: ダウンロード再取得可否を左右するため必須。

## TTL Cleanup
定義: 期限切れジョブの掃除処理。
このPJでの意味: `AsyncJobCleanupService` による成果物削除と `EXPIRED` 更新。
注意点: 削除失敗時は処理継続し、次回リトライ可能にする。

## Feature Toggle
定義: 機能有効/無効を設定で切り替える仕組み。
このPJでの意味: `sync.outbox.use`。
注意点: トグル値とモジュール依存を一致させる。

## Optional Dependency
定義: 機能が有効な場合のみ導入する依存。
このPJでの意味: `sync-connector`。
注意点: 機能不要システムに不要依存を持ち込まない。

## Notify Queue Status
定義: 通知再送制御の状態管理コード。
このPJでの意味: `NotifyQueueStatus`（`PENDING/RETRY_WAIT/SENT/FAILED`）。
注意点: `notified` だけで判定せず、`status` を正として扱う。

## Backoff
定義: 再送失敗時の待機時間を段階的に増やす制御。
このPJでの意味: `notify.queue.scan.backoff-*` 設定で `next_attempt_at` を算出する方式。
注意点: 上限（`backoff-max-delay-ms`）を設け、過大待機を防ぐ。

## System Setting Resolver
定義: システム設定を型安全に取得する共通API。
このPJでの意味: `SystemSettingResolver` / `DatabaseSystemSettingResolver`。
注意点: `SystemSettingRepository` の直接参照を避け、取得経路を一本化する。

## Dynamic Setting Key
定義: 動的設定を識別するキー文字列。
このPJでの意味: `SystemSettingKeys` に定義された定数。
注意点: 文字列直書きはキー不整合を招くため禁止する。

## Setting Cache
定義: 設定値取得時にDBアクセスを抑えるためのキャッシュ。
このPJでの意味: `SystemSettingCache` と `system.setting.cache.*` 設定。
注意点: 更新反映遅延を避けるため無効化経路を必ず持つ。

## Cache Evict
定義: キャッシュ済み設定を明示的に破棄する操作。
このPJでの意味: `SystemSettingResolver.evictAll()`。
注意点: 設定更新トランザクション完了後に実行する。

## System Setting History
定義: 設定変更前後を監査可能に保持する履歴。
このPJでの意味: `system_setting_history` と `SystemSettingHistoryService`。
注意点: 更新処理と分離しすぎると履歴欠落のリスクがある。
