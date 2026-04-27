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
