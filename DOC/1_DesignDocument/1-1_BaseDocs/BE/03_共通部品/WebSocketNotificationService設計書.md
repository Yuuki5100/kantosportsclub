# WebSocketNotificationService設計書

## 1. 目的
STOMPトピックへの通知送信を共通化し、eventType運用の揺れを抑制する。

## 2. 適用範囲
- WebSocket通知送信

## 3. モジュール概要
### 3-1. 役割
- `notifyByType(eventType, payload)` でイベント別トピック送信。
- `notifyGeneral(payload)` で汎用トピック送信。

### 3-2. 種別
- Service

## 4. 入出力仕様
### 入力
- `eventType`（必須、空白不可）
- `NotifyQueueEvent`（payload）

### 出力
- STOMP送信

## 5. 処理フロー
1. `eventType` をtrimし、空白なら `IllegalArgumentException(EX_NOTIFY_EVENT_TYPE_REQUIRED)` を送出。
2. `NotifyEventType.fromValue(...)` で既知eventTypeか判定。
3. 未知値の場合は WARN ログ（`LOG_NOTIFY_UNKNOWN_EVENT_TYPE`）を出力しつつ送信は継続。
4. `/topic/notify/{eventType.toLowerCase(Locale.ROOT)}` に送信。

## 6. 設計方針
- 既存のtopic命名ルールは維持する（`/topic/notify/{eventType小文字}`）。
- eventType enum化は段階適用とし、既存文字列運用との後方互換を維持する。

## 7. 依存関係
- `SimpMessagingTemplate`
- `NotifyEventType`（検証補助）

## 8. 利用箇所
- `NotifyQueueScanService`

## 9. 制約・注意事項
- クライアントは小文字化されたtopicを購読すること。
- 未知eventTypeでも送信はされるため、運用監視でWARNログを確認すること。

## 10. テスト観点
- `/topic/notify/{eventType}` へ送信されること。
- `REPORT_READY` が `report_ready` topicに送信されること。
- 空白eventTypeで例外送出されること。

## 11. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 1.0 | 2026/04/01 | eventType検証、未知eventType WARN、空白値例外を反映 |
| 0.1 | 2025/XX/XX | 初版 |
