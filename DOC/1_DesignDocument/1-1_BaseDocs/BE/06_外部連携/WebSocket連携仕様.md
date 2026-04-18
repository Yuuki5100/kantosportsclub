# WebSocket連携仕様

## 1. 目的
WebSocket（STOMP + SockJS）による通知連携方式と、`notify_queue` 再送制御の運用仕様を整理する。

## 2. 適用範囲
- サーバーからクライアントへの通知配信
- STOMPトピックでのイベント通知
- `notify_queue` ベース再送制御

## 3. 連携概要
### 3-1. 接続方式
- WebSocket + STOMP + SockJS
- STOMPエンドポイントは `/ws`

### 3-2. ブローカー設定
- ブローカー: `/topic`
- アプリケーションプレフィクス: `/app`

## 4. 接続仕様
| 項目 | 内容 |
|------|------|
| エンドポイント | `/ws` |
| トピック（汎用） | `/topic/notify` |
| トピック（イベント別） | `/topic/notify/{eventType}` |

- `eventType` は送信時に `Locale.ROOT` で小文字化される。
- 例: `FILE_DOWNLOAD_COMPLETED -> /topic/notify/file_download_completed`

## 5. 通知フロー概要
1. 業務処理が `NotifyQueuePublisher.publish(eventType, refId)` を実行する。
2. `notify_queue` に `PENDING` レコードを登録する。
3. `NotifyQueueScanService` が `PENDING/RETRY_WAIT` をスキャンする。
4. `WebSocketNotificationService` が `/topic/notify/{eventType}` へ通知する。
5. 送信結果に応じて `notify_queue` の状態を更新する。

## 6. 通知契機
- `ReportPollingRunner` が帳票完了時に `NotifyEventType.FILE_DOWNLOAD_COMPLETED` を登録。

## 7. エラー時・再送時の仕様

### 7-1. 状態遷移
- 成功: `PENDING/RETRY_WAIT -> SENT`
- 失敗（上限未達）: `PENDING/RETRY_WAIT -> RETRY_WAIT`
- 失敗（上限到達）: `PENDING/RETRY_WAIT -> FAILED`

### 7-2. バックオフ
- `notify.queue.scan.backoff-*` に従って次回送信時刻を算出。
- `next_attempt_at` 到達までは再送対象に含めない。

### 7-3. 監査項目
- `retry_count`, `max_retry`, `last_attempted_at`, `last_error_message` を保持。
- 最終失敗は `FAILED` として永続化し、後追い調査可能とする。

## 8. クリーンアップ
- `NotifyQueueCleanupService` が `SENT` かつ保管期限超過データを削除する。
- `FAILED` は調査用途のため保持期間方針を別途運用決定する。

## 9. 設定値
| key | 用途 | 既定値 |
| --- | --- | --- |
| `notify.queue.scan.limit` | 1回の走査件数 | `100` |
| `notify.queue.scan.fixed-delay-ms` | スキャン周期 | `10000000` |
| `notify.queue.scan.max-retry` | 再送上限 | `5` |
| `notify.queue.scan.backoff-initial-delay-ms` | 初期待機 | `1000` |
| `notify.queue.scan.backoff-multiplier` | バックオフ倍率 | `2.0` |
| `notify.queue.scan.backoff-max-delay-ms` | 待機上限 | `60000` |

## 10. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 1.0 | 2026/04/01 | 再送上限・バックオフ・永久失敗状態管理を反映 |
| 0.1 | 2025/XX/XX | 初版 |
