# NotifyQueuePublisher設計書

## 1. 目的
通知イベントを `notify_queue` に登録する共通処理を定義し、送信処理と発行処理を疎結合にする。

## 2. 適用範囲
- WebSocket通知のキュー登録
- 帳票完了などの通知イベント発行

## 3. モジュール概要
### 3-1. 役割
- `eventType` と `refId` を受け取り、再送制御可能な初期状態で `notify_queue` を作成する。

### 3-2. 種別
- Interface: `NotifyQueuePublisher`
- Service: `NotifyQueuePublisherImpl`

## 4. 入出力仕様
### 入力
- `eventType`（`String` / `NotifyEventType`）
- `refId`（Long）

### 出力
- なし（DB登録）

## 5. 処理フロー
1. `notify.queue.scan.max-retry` を読み取り、`maxRetry` を算出（1未満は1に補正）。
2. `NotifyQueue` を生成。
3. 以下初期値で保存。
   - `status=PENDING`
   - `notified=false`
   - `retryCount=0`
   - `maxRetry=<設定値>`
   - `nextAttemptAt=now(UTC)`
4. 登録ログを出力する（`LOG_NOTIFY_QUEUE_REGISTERED`）。

## 6. 依存関係
- `NotifyQueueRepository`
- `NotifyQueueScanProperties`

## 7. 利用箇所
- `ReportPollingRunner.notifyBuildQueueRegister`

## 8. 実装との整合
- 実装は `DateFormatUtil.nowUtcLocalDateTime()` を使用し、UTC基準で作成時刻を設定する。
- `publish(NotifyEventType, Long)` のデフォルト実装を提供し、eventTypeの文字列直書きを減らす。

## 9. 制約・注意事項
- topic命名ルールは送信側（`WebSocketNotificationService`）で管理するため、Publisherでは変換しない。
- eventType運用は `NotifyEventType` に寄せるが、既存文字列入力との互換は維持する。

## 10. テスト観点
- 初期状態が `PENDING/retryCount=0/maxRetry設定値` で保存されること。
- `maxRetry` が 0 以下でも 1 に補正されること。

## 11. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 1.0 | 2026/04/01 | 通知再送制御（status/maxRetry/nextAttemptAt）対応を反映 |
| 0.1 | 2025/XX/XX | 初版 |
