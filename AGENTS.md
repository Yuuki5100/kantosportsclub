# Codex Project Guide

最終更新: 2026-04-28

このファイルは、Codex がこのリポジトリで作業するときの前提・設計思想・確認手順を固定し、回答品質のばらつきと不要なトークン消費を減らすための作業指針です。

## 目的

このプロジェクトは、既存の Spring Boot / MySQL 構成を参照元として残しつつ、段階的に以下の構成へ移行する。

```text
Next.js frontend
  ↓
Hono API on Cloudflare Workers
  ↓
Cloudflare D1
```

現時点の主な作業対象は次の 2 つ。

```text
FE/spa-next/my-next-app       既存 Next.js フロントエンド
workers/api                  新規 Hono + Cloudflare Workers + D1 API
```

`BE/` は最終的には不要になる可能性があるが、現時点では API 仕様・Entity・Repository・業務ロジックの移植元として扱う。移植が終わるまで削除しない。

## 現在の基本方針

1. フロントエンドは既存の `FE/spa-next/my-next-app` を維持する。
2. API は `workers/api` に Hono で実装する。
3. DB は D1 を使い、Worker binding の `c.env.DB` 経由でアクセスする。
4. 既存 Spring Boot API は、Controller 単位で小さく Hono へ移植する。
5. 既存 API と互換性が必要なレスポンス形は維持する。
6. D1 schema は `workers/api/migrations/*.sql` を正本にする。

## ディレクトリの責務

```text
FE/spa-next/my-next-app/
  Next.js frontend。画面、hooks、API client、既存 UI を置く。

workers/api/
  Cloudflare Workers 上で動く Hono API。新規 API はここに追加する。

workers/api/src/routes/
  Hono route。HTTP method / path / request / response の入口。

workers/api/src/repositories/
  D1 SQL を実行する層。snake_case DB row を camelCase response に変換する。

workers/api/src/types/
  API response / DB row などの型。

workers/api/migrations/
  D1 schema と seed。DB 変更はここに migration として追加する。

BE/
  既存 Spring Boot backend。削除対象ではなく、移植元の仕様として読む。

NEWSQL/
  既存 SQL 資産。D1 移行時の参考にするが、MySQL 方言はそのまま使わない。
```

## API 移植ルール

既存 Spring Boot API を Hono に移植するときは、原則として次の順で読む。

```text
1. BE/appserver/src/main/java/.../controller/*Controller.java
2. BE/servercommon/src/main/java/.../model/*.java
3. BE/servercommon/src/main/java/.../repository/*Repository.java
4. FE/spa-next/my-next-app/src/api/apiEndpoints.ts
5. FE/spa-next/my-next-app/src/pages または src/components の呼び出し側
```

移植時の判断基準:

- Spring Controller が配列を直接返している場合、Hono でも配列を直接返す。
- Spring Controller が `ApiResponse<T>` を返している場合、Hono でも互換形式を維持する。
- DB column は D1 では snake_case、API response は既存 FE に合わせて camelCase にする。
- まだ認証・認可が未移植の場合、`RequirePermission` はコメントや TODO に残す程度に留め、勝手に複雑な認可基盤を作らない。
- 1 回の作業では、依頼された Controller / endpoint 周辺だけを触る。

## Hono API の実装パターン

新しい API はこの構成に合わせる。

```text
workers/api/src/routes/<feature>.ts
workers/api/src/repositories/<feature>Repository.ts
workers/api/src/types/<feature>.ts
workers/api/migrations/000X_<feature>.sql
```

route 例:

```ts
import { Hono } from "hono";
import type { AppVariables, Bindings } from "../env";

export const exampleRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();
```

D1 access 例:

```ts
const result = await db
  .prepare("SELECT id, title FROM example ORDER BY id ASC")
  .all<Row>();
```

SQL の table 名や column 名はユーザー入力から組み立てない。やむを得ず table を切り替える場合は union 型などで固定値に限定する。

## D1 / Cloudflare 前提

Workers では Java / Spring Boot / JDBC / JPA / MyBatis は使わない。

D1 では MySQL 方言をそのまま使わない。特に次を見直す。

```text
AUTO_INCREMENT  -> INTEGER PRIMARY KEY AUTOINCREMENT
DATETIME        -> TEXT または INTEGER
BOOLEAN         -> INTEGER 0/1
MySQL 関数       -> SQLite 互換へ変換
文字コード指定   -> 原則不要
```

`workers/api/wrangler.toml` の `database_id` は仮 ID の可能性がある。Cloudflare 上で D1 を作成したら実 ID に差し替える。

## フロントエンド連携

ローカルでは `FE/spa-next/my-next-app/.env.local` の API 接続先を Hono Worker に向ける。

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
```

既存 Spring Boot gateway に戻す場合は次に戻す。

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888
```

フロント側の既存 API path は `FE/spa-next/my-next-app/src/api/apiEndpoints.ts` を正本として確認する。

## ローカル起動手順

API だけを起動する場合は `workers/api` で Worker を起動する。

```bash
cd workers/api
npm run dev
```

Worker API は通常 `http://localhost:8787` で起動する。

ブラウザでアプリ全体を確認する場合は、Worker API と Next.js フロントエンドを別々のターミナルで起動する。

ターミナル 1:

```bash
cd workers/api
npm run dev
```

ターミナル 2:

```bash
cd FE/spa-next/my-next-app
npm run dev
```

Next.js は通常 `http://localhost:3000` で起動する。

初回セットアップ、または `node_modules` が無い場合は、各ディレクトリで先に依存関係をインストールする。

```bash
cd workers/api
npm install
```

```bash
cd FE/spa-next/my-next-app
npm install
```

D1 のローカル DB が未作成、または migration を反映していない場合は、Worker 起動前に次を実行する。

```bash
cd workers/api
npm run db:migrate:local
```

注意: `workers/api/package.json` では Node `>=22` が必要。

## 検証コマンド

Hono Worker の型チェック:

```bash
npm --prefix workers/api run typecheck
```

D1 migration のローカル適用:

```bash
cd workers/api
npm run db:migrate:local
```

Worker ローカル起動:

```bash
cd workers/api
npm run dev
```

疎通確認:

```bash
curl http://localhost:8787/api/health
curl http://localhost:8787/api/movies
curl http://localhost:8787/api/pictures
```

注意: Wrangler は Node 20.3+ が必要。プロジェクトの `.mise.toml` では Node 24 系を指定している。Codex 実行環境が Node 18 の場合、`tsc` は通せても `wrangler dev` は無理に実行しない。

## Codex の作業ルール

### まず見る場所

依頼が API 移植の場合、最初に広く読みすぎない。以下だけを優先する。

```text
対象 Controller
対象 Entity
対象 Repository
apiEndpoints.ts
対象画面 / 対象 component
workers/api/src
workers/api/migrations
```

リポジトリ全体の `rg` は、対象名・path・endpoint が分かってから使う。

### 触ってよい範囲

依頼が API 追加の場合、基本的に触るのは以下に限定する。

```text
workers/api/src/routes/
workers/api/src/repositories/
workers/api/src/types/
workers/api/migrations/
workers/api/README.md
workers/api/src/index.ts
```

フロント修正が必要な場合だけ `FE/spa-next/my-next-app` を触る。

`BE/` は移植元として読む。ユーザーが明示しない限り変更・削除しない。

### やらないこと

- 依頼されていない大規模リファクタ。
- `BE/` の削除。
- Docker / CI の全面変更。
- 未移植 API を勝手にまとめて作る。
- response 形式をフロント互換性なしに変更する。
- `.env.local` 以外の環境ファイルを不用意に変更する。
- secrets を `.dev.vars` や Markdown に書く。
- `node_modules` や `.wrangler` を git 管理対象にする。
- lintが通るかの検証
- curlを用いた動作確認

## 回答品質とトークン節約

Codex は次を守る。

1. 既存ファイルを読んでから判断する。
2. 読むファイルは依頼に直接関係するものに絞る。
3. 調査結果は必要な根拠だけ示す。
4. 最終回答では変更ファイル・実行した検証・残作業だけを短く書く。
5. 既存の未コミット変更はユーザーの作業として扱い、戻さない。
6. ネット検索は、最新の公式仕様が必要な場合だけ使う。
7. Cloudflare / OpenNext / Wrangler の仕様確認が必要な場合は公式 docs を優先する。
8. コマンド出力を長く貼らず、要点だけ報告する。

## 現在の実装済み Worker API

```text
GET /api/health
GET /api/movies
GET /api/pictures
```

`/api/movies` と `/api/pictures` は、既存 Spring Boot の以下に対応する。

```text
BE/appserver/src/main/java/com/example/appserver/controller/MovieController.java
BE/appserver/src/main/java/com/example/appserver/controller/PictureController.java
```

## 画面幅メモ

`FE/spa-next/my-next-app/src/pages/movies/detail.tsx` の横幅感を基準にする。

外側コンテナを `width: "min(100vw - 32px, 1280px)"` と `mx: "auto"` で揃えると見やすいページ:

```text
FE/spa-next/my-next-app/src/pages/admin/basketball-overview.tsx
FE/spa-next/my-next-app/src/pages/pictures/detail.tsx
FE/spa-next/my-next-app/src/pages/boardgames/detail.tsx
```

## API 追加時のチェックリスト

1. Spring Controller の path / method / response を確認する。
2. Entity の column と Java field 名を確認する。
3. フロントが期待する response shape を確認する。
4. D1 migration を追加する。
5. repository で D1 row を API response に変換する。
6. route を追加する。
7. `src/index.ts` に route を接続する。
8. `npm --prefix workers/api run typecheck` を実行する。
9. README に API を追記する。
10. 最終回答で未実行の検証があれば明示する。
