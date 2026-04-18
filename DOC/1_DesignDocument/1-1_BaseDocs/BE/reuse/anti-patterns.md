# アンチパターン集（バックエンド / 既存資産再利用判断用）

## 1. メモリキャッシュを正とする状態管理

### 問題
`JobStatusCache` などメモリのみで非同期状態を保持し、再起動で状態が消える。

### 正しい方法
- 状態は `async_job_execution` に永続化する。
- 成果物は `artifact_path` を保持し再取得可能にする。

## 2. ストレージ再取得不能な実装

### 問題
生成時の `InputStream` を一時保持するだけで、後続APIから再取得できない。

### 正しい方法
- `AsyncJobArtifactService.save/open` を利用する。
- `downloadReady/download` は `jobName -> artifact_path` で解決する。

## 3. 外部API直叩き

### 問題
署名付き連携を共通部品を通さず実装する。

### 正しい方法
- `sync.outbox.use=true` の場合は `SignedRestTemplate` を利用する。
- 受信側は `SyncSignatureVerificationInterceptor` で検証する。

## 4. 任意機能なのに依存を固定化

### 問題
`sync.outbox.use=false` のシステムでも `sync-connector` 依存を必須化する。

### 正しい方法
- 設定と依存を一致させる。
- 機能不要システムでは依存未導入を許容する。

## 5. 例外・ログの直書き

### 問題
エラーコード・ログ文言・例外文言をハードコードする。

### 正しい方法
- 既存共通ルールに従い、共通メッセージ基盤を利用する。

## 6. notify_queue再送制御の未実装

### 問題
- 送信失敗時に `retry_count` だけ増やし、再送上限・次回時刻・永久失敗状態を持たない。

### 正しい方法
- `status`（`PENDING/RETRY_WAIT/SENT/FAILED`）を導入する。
- `next_attempt_at` とバックオフ設定で再送時刻を管理する。
- 上限到達時は `FAILED` を保持し、`last_error_message` を残す。

## 7. 動的設定の直参照

### 問題
- 業務可変設定を `@Value` や `SystemSettingRepository` 直参照で取得し、機能ごとに実装が分散する。

### 正しい方法
- 業務可変設定は `SystemSettingResolver` 経由で取得する。
- 型変換は `SystemSettingValueConverter` に集約する。
- キーは `SystemSettingKeys` を利用し、文字列直書きを避ける。

## 8. 設定更新時の履歴/キャッシュ未連携

### 問題
- `system_setting` 更新時に履歴保存やキャッシュ無効化を行わず、監査性と反映性を損なう。

### 正しい方法
- 更新後に `SystemSettingHistoryService.recordChanges(...)` を実行する。
- 更新成功時に `SystemSettingResolver.evictAll()` を必ず実行する。
