# notify_queue定義書

## 1. 目的
WebSocket通知再送制御のための `notify_queue` テーブル定義を整理する。

## 2. テーブル定義
### 2-1. カラム
| カラム名 | 論理名 | データ型 | PK | NULL | 説明 |
| --- | --- | --- | --- | --- | --- |
| id | ID | BIGINT | ○ | × | 自動採番 |
| event_type | イベント種別 | VARCHAR(50) |  | × | 通知イベント種別 |
| ref_id | 参照ID | BIGINT |  | ○ | イベント参照ID |
| status | 通知状態 | VARCHAR(20) |  | × | `PENDING/RETRY_WAIT/SENT/FAILED` |
| notified | 通知済フラグ | BOOLEAN |  | × | 後方互換フラグ（`SENT` 判定補助） |
| retry_count | リトライ回数 | INT |  | × | 送信失敗回数 |
| max_retry | 最大リトライ回数 | INT |  | × | このレコードの再送上限 |
| created_at | 作成日時 | TIMESTAMP |  | × | 登録日時 |
| last_attempted_at | 最終試行日時 | TIMESTAMP |  | ○ | 最終送信試行日時 |
| next_attempt_at | 次回試行予定日時 | TIMESTAMP |  | ○ | バックオフ後の次回送信時刻 |
| last_error_message | 最終エラー内容 | VARCHAR(1000) |  | ○ | 送信失敗時のエラー概要 |

### 2-2. インデックス
| インデックス名 | 対象カラム | 用途 |
| --- | --- | --- |
| idx_notify_queue_dispatch | `(notified, status, next_attempt_at, created_at)` | 送信対象スキャンの最適化 |
| idx_notify_queue_event_status_created | `(event_type, status, created_at)` | イベント別最新通知取得 |

## 3. 状態遷移
- 初期登録: `PENDING`
- 送信成功: `SENT`
- 送信失敗（上限未達）: `RETRY_WAIT`
- 送信失敗（上限到達）: `FAILED`

## 4. 利用箇所
- `NotifyQueuePublisherImpl` が登録
- `NotifyQueueScanService` が参照・更新
- `NotifyQueueCleanupService` が削除（主に `SENT`）
- `NotifyQueueController` が `SENT` の最新通知を取得

## 5. 関連migration
- `BE/servercommon/src/main/resources/db/migration/V8__notify_queue_retry_control.sql`

## 6. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 1.0 | 2026/04/01 | 再送制御カラム（status/max_retry/next_attempt_at/last_error_message）を追加 |
| 0.1 | 2025/XX/XX | 初版 |
