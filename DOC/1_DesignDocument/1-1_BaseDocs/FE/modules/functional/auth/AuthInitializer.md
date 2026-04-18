# AuthInitializer モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`AuthInitializer` は、クライアント初期表示時に認証情報の復元と再検証を行う常駐コンポーネントである。

### 1-2. 適用範囲
- アプリケーション起動直後の認証初期化
- `sessionStorage` からの Redux 状態復元
- バックエンド認証状態の再確認

---

## 2. 設計方針

### 2-1. アーキテクチャ
- `useAuth()` の `refreshAuth(true)` を利用して認証確認を行う。
- Redux `dispatch` で `hydrateFromSession()` を実行する。
- `useRef` で初回実行済みフラグを保持し、多重実行を防ぐ。

### 2-2. 統一ルール
- 初回マウント時に 1 回だけ動作する。
- UI は持たず、`null` を返す。
- 復元処理とサーバー検証を同一箇所に集約する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── functional/
        └── AuthInitializer.tsx
```

---

## 4. コンポーネント仕様

**処理内容:**
1. `initialCheckDone` を確認し、初回のみ処理開始
2. `hydrateFromSession()` を dispatch してセッション情報を復元
3. `refreshAuth(true)` を呼び、バックエンド側の認証状態を検証

**仕様:**
- Redux と認証フックの橋渡し役として機能する。
- 初期描画時の認証揺らぎを抑えるため、早い段階で state を復元する。

