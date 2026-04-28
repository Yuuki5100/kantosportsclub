# Kanto Sports Club API Worker

Hono + Cloudflare Workers + D1 の API プロジェクトです。

## 初期セットアップ

Node.js は `>=22` を前提にしています。このリポジトリの `.mise.toml` では Node 24 系が指定されています。

```bash
cd workers/api
npm install
npm run db:migrate:local
npm run dev
```

ローカル起動後、次で疎通確認できます。

```bash
curl http://localhost:8787/api/health
```

## D1

`wrangler.toml` の `database_id` はローカル開発用の仮 ID です。Cloudflare 上に D1 を作成した後、実 ID に差し替えてください。

```bash
cd workers/api
npx wrangler d1 create kantosportsclub
```

作成後:

```toml
[[d1_databases]]
binding = "DB"
database_name = "kantosportsclub"
database_id = "Cloudflare が発行した database_id"
migrations_dir = "migrations"
```

## フロントエンド連携

`FE/spa-next/my-next-app/.env.local` の `NEXT_PUBLIC_API_BASE_URL` は、ローカル Worker に向けています。

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
```

既存 Spring Boot / gateway に戻す場合は、`http://localhost:8888` に戻してください。

## 実装済み API

```text
GET /api/health
GET /api/movies
GET /api/pictures
```

`GET /api/movies` と `GET /api/pictures` は query parameter による部分一致検索に対応しています。指定しない場合は全件を返します。

```bash
curl "http://localhost:8787/api/movies?title=サンプル&description=疎通"
curl "http://localhost:8787/api/pictures?title=サンプル&description=疎通"
```

検索条件:

```text
title        タイトルの部分一致
description  説明の部分一致
```

`/api/movies` と `/api/pictures` は、既存 Spring Boot の以下の Controller に合わせて配列を直接返します。

```text
BE/appserver/src/main/java/com/example/appserver/controller/MovieController.java
BE/appserver/src/main/java/com/example/appserver/controller/PictureController.java
```

レスポンス項目:

```ts
type MediaItem = {
  id: number;
  title: string | null;
  description: string | null;
  url: string | null;
  locationId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
```
