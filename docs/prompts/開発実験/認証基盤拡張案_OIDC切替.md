# 認証基盤拡張案（セッション / OIDC 切替）

## 0. 目的
- 既存の認証基盤（`authService` / `authSlice` / `useAuth`）に集約したまま、セッション認証とOIDC認証を切替可能にする。
- 画面側の独自実装を排除し、再利用方針に沿った共通導線へ寄せる。

## 1. 前提（既存基盤）
- 認証状態は `authSlice` で一元管理。
- 認証APIは `authService` に集約。
- 画面操作は `useAuth` を経由。
- ルート制御は `ProtectedRoute` / `pageConfig`。

## 2. 切替方式（提案）
- 切替は環境変数1つで行う。
- 候補: `NEXT_PUBLIC_AUTH_MODE=SESSION | OIDC`
- 未設定は既存セッション認証をデフォルト。
- 取得は `envUtils` 経由の共通関数に集約。

要確認:
- 切替を環境変数でよいか。
- runtime切替（URLパラメータ等）が必要か。

## 3. API仕様（要確認）
- 既存: `API_ENDPOINTS.AUTH.LOGIN / LOGOUT / STATUS / REFRESH`
- 追加候補（OIDC）:
  - `AUTH.EXTERNAL_LOGIN` = `/auth/external-login`
  - `AUTH.CALLBACK` = `/auth/callback`

要確認:
- バックエンドに上記APIが存在するか。
- リクエスト/レスポンス仕様。
- 既存APIバージョン切替との整合。

## 4. authService 拡張案
### 4.1 追加関数
- `getExternalLoginUrlApi(params)`
  - 外部ログイン開始URLを取得。
- `exchangeCallbackApi(params)`
  - OIDC callback code/state を認証状態に交換。

### 4.2 既存関数の維持
- `loginApi` / `logoutApi` / `checkAuthApi` / `refreshAuthApi` は既存通り。
- OIDCモード時は `loginApi` の代わりに `getExternalLoginUrlApi` を使用。

### 4.3 モック対応
- `authService` facade で mock/real を切替。
- OIDC APIがモック未実装なら `MockNotImplementedError` で real fallback。

## 5. authSlice 拡張案
### 5.1 追加状態
- `authMode: 'session' | 'oidc'`
- `oidcStatus: 'idle' | 'loading' | 'failed'`
- `oidcError?: string`

### 5.2 追加Thunk
- `startOidcLogin`
  - `authService.getExternalLoginUrlApi` を呼び出し、URLへリダイレクト。
- `completeOidcLogin`
  - `authService.exchangeCallbackApi` を呼び出し、結果に応じて `checkAuth` へ統一。

### 5.3 既存の統合
- `checkAuth` で最終的に `authState` を更新。
- `login` / `logout` は session モードで使用。

## 6. useAuth 拡張案
- `loginUser` をモード分岐するラッパーに変更。
  - `session` → 既存 `login` thunk
  - `oidc` → `startOidcLogin` thunk
- `completeOidcLogin` を `useAuth` から提供。
- `authMode` を `useAuth` から参照可能にする。

## 7. 画面導線の整理
### 7.1 login 画面
- `useAuth.loginUser` に統一。
- OIDC時は外部ログインへ遷移、セッション時は従来通り。

### 7.2 callback 画面
- `useAuth.completeOidcLogin` のみを呼ぶ。
- `sessionStorage` への直接保存は廃止。

### 7.3 oidcLoginTest
- サンプル用途でも `useAuth` 経由に統一。

## 8. エラー/通知
- 既存の `errorHandler` / `useSnackbar` を通す。
- authService 内で `handleApiError` を使用。

## 9. 切替フロー（簡易）
### セッション
- login画面 → `loginApi` → `checkAuth` → `authSlice` 更新

### OIDC
- login画面 → `getExternalLoginUrlApi` → リダイレクト
- callback → `exchangeCallbackApi` → `checkAuth` → `authSlice` 更新

## 10. 未決事項（要確認）
- OIDCの正式APIパス・レスポンス仕様。
- トークンをフロント保持する必要有無。
- `callback` で `checkAuth` を同期的に呼ぶか、状態遷移後に呼ぶか。
- 本番環境での OIDC 無効化ルール。

## 11. 影響範囲（設計対象）
- `FE/spa-next/my-next-app/src/api/services/v1/authService.ts`
- `FE/spa-next/my-next-app/src/api/services/v1/real/authService.ts`
- `FE/spa-next/my-next-app/src/api/services/v1/mock/authService.ts`
- `FE/spa-next/my-next-app/src/slices/authSlice.ts`
- `FE/spa-next/my-next-app/src/hooks/useAuth.ts`
- `FE/spa-next/my-next-app/src/pages/login/index.tsx`
- `FE/spa-next/my-next-app/src/pages/callback.tsx`
- `FE/spa-next/my-next-app/src/pages/oidcLoginTest.tsx`

以上。
