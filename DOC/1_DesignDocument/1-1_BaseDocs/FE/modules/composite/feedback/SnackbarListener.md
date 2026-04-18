# SnackbarListener モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`SnackbarListener` は、WebSocket 経由で受信した最新通知を監視し、通知内容に応じて Snackbar 表示へ変換する常駐コンポーネントである。

### 1-2. 適用範囲
- グローバル通知の画面内表示
- ファイルアップロード/ダウンロード完了通知
- セッション期限切れなどのイベント通知

---

## 2. 設計方針

### 2-1. アーキテクチャ
- `useLatestNotification()` で最新通知を取得する。
- `useSnackbar()` の `showSnackbar` を使って表示する。
- `useRef` で前回処理した通知 ID を保持し、重複通知を防ぐ。

### 2-2. 統一ルール
- 同一通知 ID の再処理は行わない。
- イベント種別から表示メッセージへ変換する。
- UI 要素は持たず、`null` を返す常駐コンポーネントとする。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── composite/
        └── SnackbarListener.tsx
```

---

## 4. コンポーネント仕様

**主なイベント処理:**
- `FILE_CREATE_PROGRESS` - Snackbar は表示しない
- `FILE_UPLOAD_COMPLETED` - 成功通知表示
- `FILE_DOWNLOAD_COMPLETED` - ダウンロード準備完了通知表示
- `USER_SESSION_EXPIRED` - エラー通知表示
- `default` - `eventType` をそのまま警告表示

**仕様:**
- 通知本文は `getMessage(MessageCodes.xxx)` から取得する。
- `handledId.current` に最後に処理した通知 ID を保持する。
- 将来的にセッション期限切れ時の画面遷移を追加しやすい構成とする。

