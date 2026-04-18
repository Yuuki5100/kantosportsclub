# 📘 WebSocket通知モジュール設計書

## 概要

本モジュールは、サーバー内で発生したイベントを非同期にクライアントへ通知するために、**Spring WebSocket (STOMP + SockJS)** を利用したリアルタイム通知機構を提供する。
イベントは一度データベース上にキューイングされ、専用のスキャンサービスにより STOMP トピックを通じて配信される。

---

## 1. 技術スタック

| 要素       | 使用技術                                       |
| -------- | ------------------------------------------ |
| 通信方式     | WebSocket（STOMP + SockJS）                  |
| メッセージ配信  | Spring Messaging (`SimpMessagingTemplate`) |
| バックエンドDB | RDB（JPA / Hibernate）                       |
| スケジューラ   | Spring `@Scheduled`                        |

---

## 2. 全体アーキテクチャ

```
+-------------+      REST POST        +------------------+     persist     +----------------+
|   任意の    |  ------------------>  | NotifyQueuePublisher | ------------> |  notify_queue   |
| Trigger元    |                      +------------------+                 +----------------+
                                                |
                                                ▼
                                   [@Scheduled スキャン]
                                                |
                                                ▼
+------------------+   notify()    +-----------------------------+    convertAndSend()    +------------------+
| NotifyQueueScan  |  ---------->  | WebSocketNotificationService|  ------------------>  | WebSocket Client |
+------------------+               +-----------------------------+                        +------------------+
```

---

## 3. エンドポイント定義

### WebSocketエンドポイント

| URLパス | 説明                         |
| ----- | -------------------------- |
| `/ws` | WebSocket STOMP 接続用エンドポイント |

### トピック

| トピックパス                  | 説明                     |
| ----------------------- | ---------------------- |
| `/topic/notify`         | 一般通知（汎用イベント）           |
| `/topic/notify/{event}` | イベント種別別通知（gate\_in など） |

---

## 4. クラス設計

### 🔷 `WebSocketConfig`

* WebSocket STOMP 設定クラス。
* `/ws` に対する SockJS 接続の許可と、`/topic` トピック、`/app` アプリケーション送信プレフィクスを構成。

---

### 🔷 `NotifyQueue`

* 永続化される通知イベントモデル（JPAエンティティ）。
* カラム：`eventType`, `refId`, `status`, `notified`, `retryCount`, `maxRetry`, `createdAt`, `lastAttemptedAt`, `nextAttemptAt`, `lastErrorMessage`

---

### 🔷 `NotifyQueuePublisher`

* 通知イベントの発行（登録）インターフェース。
* 実装：`NotifyQueuePublisherImpl` が `notify_queue` に非通知レコードを追加。

---

### 🔷 `NotifyQueueScanService`

* `@Scheduled` により `notify.queue.scan.fixed-delay-ms` 間隔で再送対象をスキャン。
* 対象は `status in (PENDING, RETRY_WAIT)` かつ `nextAttemptAt <= now`。
* WebSocket ブロードキャスト成功時は `SENT`（`notified=true`）へ更新。
* 通知失敗時は `retryCount` をインクリメントし、上限未達なら `RETRY_WAIT`、到達時は `FAILED` へ更新。

---

### 🔷 `WebSocketNotificationService`

* STOMPトピックへ通知を送信するユーティリティ。
* `notifyByType(eventType, payload)`： `/topic/notify/{eventType}` へ送信
* `notifyGeneral(payload)`： `/topic/notify` へ汎用送信

---

### 🔷 `NotifyQueueController`

* `/api/notify/latest?type=xxx` で最新の通知済イベントを取得可能。

---

### 🔷 `NotifyQueueCleanupService`

* Batchモジュールで 3:00 に7日超の `notified=true` レコードを削除。

---

## 5. シーケンス（例：gate\_in イベント）

```plaintext
[アプリケーションイベント発生]
       ↓
NotifyQueuePublisher.publish("GATE_IN", 123)
       ↓
notify_queue テーブルに登録
       ↓ (`notify.queue.scan.fixed-delay-ms` ごと)
NotifyQueueScanService.scanAndNotify()
       ↓
WebSocketNotificationService.notifyByType("GATE_IN", payload)
       ↓
/topic/notify/gate_in に WebSocket 経由で通知
```

---

## 6. 保守・拡張性

| 項目      | 現状                  | 今後の拡張方針                       |
| ------- | ------------------- | ----------------------------- |
| イベント型定義 | 任意文字列（例: GATE\_IN）  | Enum化、メタデータ付き構造の導入            |
| メタデータ拡張 | `metadata` は現状 null | `Map<String, Object>`で柔軟に拡張可能 |
| 再送制御    | 上限/バックオフ/永久失敗を実装済み | 運用監視（FAILED残件、遅延傾向）の強化 |
| セキュリティ  | CORS全許可、未認証         | Origin制限、JWT認証導入              |

---

## 7. 留意点

* クライアントは必ず STOMP + SockJS で `/ws` に接続する必要がある。
* 高頻度通知におけるパフォーマンスと並列処理へのスケーラビリティは今後の課題。

---
## 8. 開発者が実装すべきこと（個別実装範囲）
これだけ実装すれば基本問題なく動作します。処理順に記載しております。

### 8.1. FEにwebsokectの起動処理を記載してください（第4引数はカスタムです）
```tsx
connectWebSocket(onMessage, showSuccess, showError, 'FILE_UPLOAD_COMPLETED')
```

### 8.2. BEで「notify_queqe」テーブルに保存する処理を書いてください
***publishの第一引数と「1.」の第4引数は同一になるようにしてください***
```java
  notifyQueuePublisherImpl.publish("FILE_UPLOAD_COMPLETED",'12345L')
```

### 8.3. FEでBEから通知を受け取った際の処理を記載してください
```tsx
    const handleMessage = (payload: NotificationPayload) => {
      console.log('🔔 通知受信:', payload);
      const resEventType = payload.eventType;
      const resRefId = payload.refId;
      // イベント種別に応じて処理を分ける
      if (resEventType === 'FILE_UPLOAD_COMPLETED' && refId === resRefId) {
        console.log(`📦 インポート完了通知: refId`);
        disconnectWebSocket(); // 通知したらwebsocket切断
      }
    }
```

### 8.4. 環境を起動して、通知が来ているか開発コンソールから確認してください
***確認手段***
- WebでF12キー押下>Networkタブ>websocket>'Message'と記載があるレコードがあれば通知が来ています
- もしくは、tsx等にブレークポイントやコンソールログを埋め込んで処理が来ているか確認してください

### 8.5. バグで通知が来ないときに、疑うべきこと
- websocketを起動しているか？
- 通知の文字列は一言一句正しいか？
- FEで受け取る通知の条件式が小文字/大文字あっているか？
- BEの「notify_queqe」テーブルのeventTypeがFEで記載した文字列と同一か？
- そもそもnotify_queqe」テーブルにレコードが追加されているか？
- 予期しない所で、websocketが切断されていないか？
- VPN接続が必要な処理ではないか？
---
## 注記（分解済み参照先）
- 外部連携仕様: `DOC/1_DesignDocument/1-1_BaseDocs/BE/06_外部連携/WebSocket連携仕様.md`
- 共通部品: `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/NotifyQueuePublisher設計書.md`
- 共通部品: `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/NotifyQueueScanService設計書.md`
- 共通部品: `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/WebSocketNotificationService設計書.md`
- DB定義: `DOC/1_DesignDocument/1-1_BaseDocs/BE/08_状態_コード定義/notify_queue定義書.md`
