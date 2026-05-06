# 本番認証の設定案

最終更新: 2026-05-06

## 方針

このプロジェクトの本番認証は、Cookie ベースではなくトークンベースに寄せる。

理由:

- `pages.dev` と `workers.dev` をまたぐ Cookie 共有は本番で不安定
- iPhone Safari を含む一部ブラウザでは第三者 Cookie が厳しい
- `Authorization: Bearer ...` ならオリジン分離の影響を受けにくい

現状の実装方針は次の通り。

- access token を `localStorage` に保存する
- refresh token も `localStorage` に保存する
- API リクエスト時に `Authorization` ヘッダを自動付与する
- `/auth/refresh` は body で refresh token を受け取る
- `/auth/logout` も body で refresh token を受け取る

## 影響範囲

### フロントエンド

- `src/utils/authTokenStorage.ts`
  - access token / refresh token の保存・取得・削除
- `src/api/apiClient.ts`
  - `Authorization: Bearer <accessToken>` を自動付与
- `src/api/services/v1/real/authService.ts`
  - login 時にトークン保存
  - refresh 時に refresh token を body 送信
  - logout 時に refresh token を body 送信
  - `/auth/status` が 401 の場合は refresh を 1 回試行
- `src/slices/authSlice.ts`
  - 認証失敗・ログアウト時にトークン削除
- `src/mocks/auth/handlers.ts`
  - mock でも access / refresh token を返す

### API

- `workers/api/src/routes/auth.ts`
  - login / refresh / callback で access token と refresh token を JSON 返却
  - logout は body もしくは Authorization の refresh token を受け取る
  - Cookie の `setCookie` / `deleteCookie` は使わない
- `workers/api/src/middleware/authRequired.ts`
  - 既存通り `Authorization` を優先して認証する

## 本番設定

### フロント側

本番のフロント環境変数は、API の本番 URL を向ける。

```env
NEXT_PUBLIC_API_BASE_URL=https://api.kantosportsclub.com
```

ローカルは引き続き次のようにする。

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_PROXY_TARGET=http://localhost:8787
```

ローカルでは Next.js の rewrite を使い、`localhost:3000` 経由で Worker に流す。

### Worker 側

本番 Worker は custom domain で公開する。

例:

- `https://api.kantosportsclub.com`

Pages 側も custom domain を付ける。

例:

- `https://app.kantosportsclub.com`

### Cookie 設定

この案では本番で Cookie 認証を使わないため、`SameSite` や `Secure` を気にする必要はない。

もし将来的に Cookie 認証へ戻すなら、同一カスタムドメイン配下に寄せる必要がある。

## README に書くべき内容

### `FE/spa-next/my-next-app/README.md`

追加したい内容:

- 本番は `NEXT_PUBLIC_API_BASE_URL=https://api.kantosportsclub.com`
- ローカルは `http://localhost:3000` + rewrite を使う
- 認証は localStorage + Authorization header ベース
- Cookie 共有は前提にしない

### `workers/api/README.md`

追加したい内容:

- 認証は access token / refresh token を JSON で返す
- `/auth/refresh` と `/auth/logout` は refresh token を body で受け取る
- 本番は custom domain の API を使う
- Cookie ベース認証ではないため `SameSite` の調整は不要

## `.env.production` 相当のメモ

フロントの本番環境変数は次のイメージ。

```env
NEXT_PUBLIC_API_BASE_URL=https://api.kantosportsclub.com
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_REACT_QUERY_STALE_TIME=30000
NEXT_PUBLIC_REACT_QUERY_CACHE_TIME=90000
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_ERROR_NOTIFICATION_TIMEOUT=5000
NEXT_PUBLIC_USE_MOCK_MODE=false
```

Worker 側の本番環境変数は次のイメージ。

```env
COOKIE_SECURE=true
CORS_ORIGIN=https://app.kantosportsclub.com
```

補足:

- `COOKIE_SECURE` は、将来 Cookie 認証に戻す場合のための設定
- 現行のトークン方式では実質的に未使用

## 運用手順

1. Cloudflare で独自ドメインを用意する
2. Pages に `app.kantosportsclub.com` を設定する
3. Worker に `api.kantosportsclub.com` を設定する
4. フロントの本番 API base URL を `https://api.kantosportsclub.com` にする
5. 認証レスポンスで access / refresh token を受け取る
6. フロントは `Authorization` ヘッダで API を呼ぶ
7. `localStorage` のトークンが消えないか確認する

## 注意点

- `pages.dev` と `workers.dev` を跨ぐ Cookie 共有は採用しない
- トークンは `localStorage` 保存のため、XSS 対策はこれまで以上に重要になる
- `apiClient` は全 API 呼び出しで `Authorization` を自動付与する前提
- `refresh token` を body で送るため、ログ出力や開発時の console には出しすぎない

## 現時点の判断

Cookie 共有で本番を成立させるより、トークンベース認証へ切り替える方が、このリポジトリの現状には合っている。

そのため、今後の本番構成の前提は次の通り。

- フロントと API は別オリジンでもよい
- 認証は `Authorization` ベース
- Cookie ベースのセッション共有は前提にしない
