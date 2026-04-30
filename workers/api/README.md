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
npx wrangler d1 create kantosportsclub-db
```

作成後:

```toml
[[d1_databases]]
binding = "kantosportsclub_db"
database_name = "kantosportsclub-db"
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
GET /api/boardgames
GET /api/movies
POST /api/movies
PUT /api/movies/:id
GET /api/pictures
POST /api/pictures
PUT /api/pictures/:id
GET /api/master_locations
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

映画の情報を更新する場合:

```bash
curl -X PUT "http://localhost:8787/api/movies/1" \
  -H "Content-Type: application/json" \
  -d '{"title":"更新後タイトル","description":"更新後説明","url":"https://example.com/movie.mp4","locationId":"1"}'
```

`PUT /api/movies/:id` は `updatedAt` を現在日時で更新し、更新後の `MediaItem` を返します。

`POST /api/pictures` と `PUT /api/pictures/:id` も同じ request body で画像情報を登録・更新し、更新後の `MediaItem` を返します。

映画を追加する場合:

```bash
curl -X POST "http://localhost:8787/api/movies" \
  -H "Content-Type: application/json" \
  -d '{"title":"新規動画","description":"動画の説明"}'
```

`POST /api/movies` は `location_id = 1` として保存し、`createdAt` / `updatedAt` は現在日時で登録します。
レスポンスでは `master_locations` と結合した `locationName` を返します。

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
  locationName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
```

`GET /api/boardgames` は `boardgames` テーブルの内容を配列で直接返します。

```ts
type BoardgameItem = {
  id: number;
  boardgameName: string | null;
  ownerName: string | null;
  peopleMin: number | null;
  peopleMax: number | null;
  needTime: number | null;
  urlStr: string | null;
  howToPlay: string | null;
  remarks: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
```

`GET /api/master_locations` は場所選択用の配列を直接返します。

```ts
type MasterLocationItem = {
  locationId: number;
  locationName: string | null;
};
```
