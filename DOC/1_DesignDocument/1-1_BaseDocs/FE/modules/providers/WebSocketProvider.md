# WebSocketProvider モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`WebSocketProvider` は、WebSocket クライアントと通知管理機能を React Context として提供する Provider である。通知受信、イベントハンドラー登録、接続状態参照を画面全体で共有できるようにする。

### 1-2. 適用範囲
- リアルタイム通知受信
- 画面横断のイベント購読
- WebSocket 接続状態の共通管理

---

## 2. 設計方針

### 2-1. アーキテクチャ
- `WebSocketClient` を 1 度だけ生成し、Context に保持する。
- イベントハンドラーは `eventType -> subscription[]` の形で state 管理する。
- 通知は `notifications` 配列として蓄積する。
- 認証状態に応じて自動接続/切断を制御する。

### 2-2. 統一ルール
- Context 外で Hook を使用した場合は例外を送出する。
- 通知には `id` と `timestamp` を補完する。
- `autoConnect=true` かつ認証済みの場合に自動接続する。
- Provider アンマウント時は接続を切断する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── providers/
        └── WebSocketProvider.tsx
```

---

## 4. Provider 仕様

### 4-1. WebSocketProviderProps

| Prop | 型 | 必須 | デフォルト | 説明 |
|------|----|------|-----------|------|
| `children` | `ReactNode` | ○ | - | 配下コンポーネント |
| `ClientFactory?` | `() => WebSocketClient` | × | `createDefaultWebSocketClient` | クライアント生成関数 |
| `autoConnect?` | `boolean` | × | `true` | 自動接続するか |
| `debug?` | `boolean` | × | `false` | デバッグログ出力 |

### 4-2. Context が提供する機能
- `client` - WebSocket クライアント本体
- `addHandler(eventType, handler, isGlobal)` - イベント購読登録
- `removeHandler(eventType, handlerId)` - イベント購読解除
- `getHandlers(eventType)` - 購読一覧取得
- `getActiveEventTypes()` - 有効イベント種別一覧取得
- `notifications` - 受信通知一覧
- `addNotification(notification)` - 通知追加
- `clearNotifications()` - 通知クリア

### 4-3. 公開 Hook
- `useWebSocketClient()` - クライアント取得
- `useWebSocketContext()` - Context 全体取得
- `useWebSocketStatus()` - 接続状態取得
- `useNotifications()` - 通知一覧取得
- `useLatestNotification()` - 最新通知取得
- `useClearNotifications()` - 通知クリア関数取得

---

## 5. 通知仕様

### 5-1. NotificationPayload

```ts
export type NotificationPayload = {
  id?: string;
  eventType: string;
  refId?: string;
  extension?: string;
  jobName?: string;
  fileName?: string;
  message?: string;
  timestamp?: number;
  [key: string]: any;
};
```

### 5-2. 振る舞い
- `id` 未指定時は `uuid` を採番する。
- `timestamp` 未指定時は `Date.now()` を補完する。
- 通知は配列末尾へ追加し、`useLatestNotification()` で最後の要素を参照する。

