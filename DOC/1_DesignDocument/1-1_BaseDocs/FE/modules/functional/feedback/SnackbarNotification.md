# SnackbarNotification モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`SnackbarNotification` は、アプリケーション共通のトースト通知を画面上部に表示するコンポーネントである。通知種別に応じた色・アイコン・自動消去制御を行う。

### 1-2. 適用範囲
- 成功/警告/エラーの通知表示
- 画面共通の一時メッセージ表示
- `useSnackbar()` と組み合わせたグローバル通知

---

## 2. 設計方針

### 2-1. アーキテクチャ
- `useSnackbar()` から `message` `type` `hideSnackbar` を取得する。
- React Portal により `snackbar-root` 要素へ描画する。
- 通知種別ごとにアイコンと背景色を切り替える。

### 2-2. 統一ルール
- `ERROR` 以外は一定時間後に自動で閉じる。
- `ERROR` は手動クローズを前提とする。
- 表示位置は画面上部中央固定とする。
- アニメーションは上からのフェードインを採用する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── functional/
        └── SnackbarNotification.tsx
```

---

## 4. コンポーネント仕様

**使用状態:**
- `message` - 表示メッセージ
- `type` - `SUCCESS` / `ERROR` / `ALERT`
- `hideSnackbar()` - 通知非表示処理

**仕様:**
- タイムアウト値は `NEXT_PUBLIC_SNACKBAR_TIMEOUT`、未設定時は `5000ms` を使用する。
- 背景色は `SUCCESS=green` `ERROR=red` `ALERT=orange` とする。
- アイコンは `CheckCircleIcon` `ErrorIcon` `WarningIcon` を切り替える。
- `document.getElementById('snackbar-root')` へ Portal 描画する。

