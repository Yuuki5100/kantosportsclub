# ProtectedRoute モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`ProtectedRoute` は、認証状態と権限設定に基づいて画面表示可否を判定するルートガードコンポーネントである。

### 1-2. 適用範囲
- 認証必須画面の保護
- ページ単位の権限制御
- 未認証時のログイン画面遷移

---

## 2. 設計方針

### 2-1. アーキテクチャ
- `useRouter()` により現在パスを取得する。
- `getPageConfig()` と `findPageConfigByPath()` でページ設定を探索する。
- `useAuth()` の `isAuthenticated` と `rolePermissions` を用いて表示可否を判定する。

### 2-2. 統一ルール
- 認証未確定時は描画を保留する。
- 未認証時は `/login` へ遷移する。
- 権限不足時は `/403` へ遷移する。
- ルート変更時は一度 `allowRender` を `false` に戻してフラッシュを抑止する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── functional/
        └── ProtectedRoute.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `children: ReactNode` - 保護対象の描画内容

**仕様:**
- ページ設定が存在しない場合は、認証済みであれば描画を許可する。
- `requiredPermission > 0` のページでは、`permissionTargetKey` または `resourceKey` を用いて権限レベルを評価する。
- `rolePermissions` 未取得時は判定を待機する。
- 描画許可後のみ `children` を返す。

