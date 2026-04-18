# NotifyQueueScanService設計書

## 1. 目的
`notify_queue` をスキャンし、送信結果に応じて再送制御状態を更新する。

## 2. 適用範囲
- WebSocket通知の送信ジョブ
- 一時失敗の再送制御

## 3. モジュール概要
### 3-1. 役割
- 送信対象（`PENDING/RETRY_WAIT`）を抽出して通知する。
- 送信成功/失敗に応じて `status` / `retryCount` / `nextAttemptAt` / `lastErrorMessage` を更新する。

### 3-2. 種別
- Service（`@Scheduled`）

## 4. 主要構成
| 種別 | 名称 | 役割 |
|------|------|------|
| Service | `NotifyQueueScanService` | スキャン/送信/状態更新 |
| Repository | `NotifyQueueRepository` | 送信対象抽出・保存 |
| Service | `WebSocketNotificationService` | STOMP送信 |
| Properties | `NotifyQueueScanProperties` | 上限/バックオフ設定 |

## 5. 入出力仕様
### 入力
- `notify_queue`（`status in (PENDING, RETRY_WAIT)` かつ `next_attempt_at <= now`）

### 出力
- WebSocket通知
- `notify_queue` 更新

## 6. 状態遷移
- 成功: `PENDING/RETRY_WAIT -> SENT`
- 一時失敗（上限未達）: `PENDING/RETRY_WAIT -> RETRY_WAIT`
- 上限到達: `PENDING/RETRY_WAIT -> FAILED`

更新項目:
- 成功時: `notified=true`, `lastAttemptedAt=now`, `nextAttemptAt=null`, `lastErrorMessage=null`
- 失敗時: `notified=false`, `retryCount++`, `lastAttemptedAt=now`, `lastErrorMessage=例外文字列(1000文字まで)`

## 7. バックオフ計算
- 基本式: `initialDelay * multiplier^(retryCount-1)`
- `backoff-max-delay-ms` を上限とする。
- 設定防御:
  - `initialDelay < 0` は 0 扱い
  - `multiplier < 1.0` は 1.0 扱い
  - overflow/NaN/Infinity は maxDelay 扱い

## 8. 設定値
| key | 既定値 | 用途 |
| --- | --- | --- |
| `notify.queue.scan.limit` | `100` | 1回の取得件数 |
| `notify.queue.scan.fixed-delay-ms` | `10000000` | スキャン間隔 |
| `notify.queue.scan.max-retry` | `5` | 再送上限 |
| `notify.queue.scan.backoff-initial-delay-ms` | `1000` | 初期待機 |
| `notify.queue.scan.backoff-multiplier` | `2.0` | バックオフ倍率 |
| `notify.queue.scan.backoff-max-delay-ms` | `60000` | 待機上限 |

## 9. 依存関係
- `NotifyQueueRepository`
- `WebSocketNotificationService`
- `NotifyQueueScanProperties`

## 10. 利用箇所
- `@Scheduled` で自動実行
- `scanAndNotifyById(refId)` で手動再送（対象状態のみ）

## 11. 制約・注意事項
- topic命名規則（`/topic/notify/{eventType.toLowerCase}`）は変更しない。
- `eventType` の解釈は送信サービス側で担保し、ScanServiceは透過的に扱う。

## 12. テスト観点
- 成功時に `SENT` へ遷移すること。
- 一時失敗時に `RETRY_WAIT` と `nextAttemptAt` が設定されること。
- 上限到達で `FAILED` へ遷移すること。
- dispatch対象外状態が送信されないこと。

## 13. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 1.0 | 2026/04/01 | 再送上限・バックオフ・永久失敗状態管理を反映 |
| 0.1 | 2025/XX/XX | 初版 |
