# Next.js / Hono + Cloudflare Workers + D1 フォルダ構成案

確認日: 2026-04-27

このリポジトリは現在、概ね以下の構成です。

```text
.
├── FE/spa-next/my-next-app/   # 既存 Next.js フロントエンド
├── BE/                        # 既存 Spring Boot バックエンド
├── NEWSQL/                    # 既存 SQL
├── docker/                    # ローカル Docker 検証
├── CI/
├── DOC/
└── package.json               # 現状は実質空
```

Cloudflare Workers + D1 に寄せる場合、重要なのは「Worker プロジェクトの単位」を明確にすることです。D1 は Worker の `env.DB` のような binding 経由で使うため、従来の `jdbc:mysql://...` や Spring Boot/JPA/MyBatis の接続層はそのままでは使えません。

## 推奨方針

現状のプロジェクトには既に Next.js フロントと Spring Boot API があるため、移行しやすい順は次です。

1. `FE/spa-next/my-next-app` は維持する
2. 新しく `workers/api` に Hono API Worker を作る
3. Hono から D1 を読む/書く
4. 既存 Spring Boot の `/api/...` を機能単位で Hono に移植する
5. フロントの `NEXT_PUBLIC_API_BASE_URL` を Hono Worker に向ける

つまり、このリポジトリではまず「Next.js + 別 Hono API Worker + D1」が扱いやすいです。

## 案 A: 既存 Next.js + Hono API Worker + D1

既存フロントを残し、Cloudflare Workers 上に API 専用の Hono Worker を足す構成です。

```text
.
├── FE/
│   └── spa-next/
│       └── my-next-app/
│           ├── package.json
│           ├── next.config.ts
│           ├── src/
│           │   ├── pages/
│           │   ├── api/
│           │   ├── components/
│           │   └── hooks/
│           └── .env.local
│
├── workers/
│   └── api/
│       ├── package.json
│       ├── wrangler.toml
│       ├── tsconfig.json
│       ├── worker-configuration.d.ts
│       ├── .dev.vars                 # ローカル用。原則 git 管理しない
│       ├── migrations/
│       │   ├── 0001_init.sql
│       │   ├── 0002_seed_master.sql
│       │   └── 0003_add_notice.sql
│       ├── src/
│       │   ├── index.ts              # Worker entrypoint
│       │   ├── env.ts                # Bindings 型
│       │   ├── routes/
│       │   │   ├── health.ts
│       │   │   ├── auth.ts
│       │   │   ├── users.ts
│       │   │   ├── roles.ts
│       │   │   ├── notices.ts
│       │   │   └── system.ts
│       │   ├── db/
│       │   │   ├── d1.ts             # D1 helper
│       │   │   ├── schema.ts         # 任意: Drizzle 等を使う場合
│       │   │   └── repositories/
│       │   │       ├── userRepository.ts
│       │   │       ├── roleRepository.ts
│       │   │       └── noticeRepository.ts
│       │   ├── services/
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── cors.ts
│       │   │   └── errorHandler.ts
│       │   ├── schemas/              # Zod 等の request/response validation
│       │   └── types/
│       └── test/
│
├── packages/
│   └── shared/
│       ├── package.json
│       └── src/
│           ├── apiTypes.ts
│           └── constants.ts
│
├── NEWSQL/
├── BE/
├── docker/
└── CLOUDFLARE_WORKERS_D1_FOLDER_STRUCTURE.md
```

### Hono Worker の最小ファイル

`workers/api/wrangler.toml`

```toml
name = "kantosportsclub-api"
main = "src/index.ts"
compatibility_date = "2026-04-27"

[[d1_databases]]
binding = "DB"
database_name = "kantosportsclub"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
migrations_dir = "migrations"
```

`workers/api/src/env.ts`

```ts
export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
};
```

`workers/api/src/index.ts`

```ts
import { Hono } from "hono";
import type { Env } from "./env";
import { healthRoutes } from "./routes/health";
import { userRoutes } from "./routes/users";

const app = new Hono<{ Bindings: Env }>();

app.route("/api/health", healthRoutes);
app.route("/api/user", userRoutes);

export default app;
```

`workers/api/src/routes/health.ts`

```ts
import { Hono } from "hono";
import type { Env } from "../env";

export const healthRoutes = new Hono<{ Bindings: Env }>();

healthRoutes.get("/", async (c) => {
  const row = await c.env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
  return c.json({ status: "ok", db: row?.ok === 1 });
});
```

## 案 B: Next.js 自体を Cloudflare Workers に載せ、D1 も Next 側から使う

Next.js の Route Handlers / API Routes / Server Actions から D1 を直接使う構成です。Cloudflare Workers への Next.js デプロイには OpenNext adapter を使います。

```text
.
└── FE/
    └── spa-next/
        └── my-next-app/
            ├── package.json
            ├── next.config.ts
            ├── open-next.config.ts
            ├── wrangler.jsonc
            ├── cloudflare-env.d.ts
            ├── migrations/
            │   ├── 0001_init.sql
            │   └── 0002_seed_master.sql
            ├── src/
            │   ├── app/                         # App Router に寄せる場合
            │   │   └── api/
            │   │       ├── health/route.ts
            │   │       ├── user/route.ts
            │   │       └── notice/route.ts
            │   ├── pages/                       # 既存 Pages Router
            │   ├── server/
            │   │   ├── db/
            │   │   │   ├── d1.ts
            │   │   │   └── repositories/
            │   │   └── services/
            │   ├── components/
            │   ├── hooks/
            │   └── api/
            └── public/
```

### Next.js on Workers の最小ファイル

`FE/spa-next/my-next-app/open-next.config.ts`

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
```

`FE/spa-next/my-next-app/wrangler.jsonc`

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "kantosportsclub-web",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-04-27",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "kantosportsclub",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "migrations_dir": "migrations"
    }
  ]
}
```

`FE/spa-next/my-next-app/package.json` に追加する script 例

```json
{
  "scripts": {
    "preview:cf": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy:cf": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts",
    "db:migration:create": "wrangler d1 migrations create kantosportsclub",
    "db:migrate:local": "wrangler d1 migrations apply kantosportsclub --local",
    "db:migrate:remote": "wrangler d1 migrations apply kantosportsclub --remote"
  }
}
```

## 案 C: Hono フルスタック + D1

Next.js を使わず、Hono API と静的フロントを Workers Assets で配信する構成です。React/Vite SPA などと相性が良いです。

```text
.
└── apps/
    └── hono-fullstack/
        ├── package.json
        ├── wrangler.toml
        ├── tsconfig.json
        ├── public/                  # Workers Assets で配信する静的ファイル
        ├── migrations/
        │   └── 0001_init.sql
        └── src/
            ├── index.ts             # Hono entrypoint
            ├── routes/
            ├── db/
            ├── middleware/
            └── client/              # 任意: Vite/React ソース
```

`wrangler.toml`

```toml
name = "kantosportsclub"
main = "src/index.ts"
compatibility_date = "2026-04-27"
assets = { directory = "public" }

[[d1_databases]]
binding = "DB"
database_name = "kantosportsclub"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
migrations_dir = "migrations"
```

## 必ず必要になるもの

Cloudflare Workers + D1 構成では、少なくとも次が必要です。

```text
wrangler.toml または wrangler.jsonc
migrations/*.sql
src/index.ts または .open-next/worker.js
D1 binding 型定義
D1 アクセス層
デプロイ/ローカル実行 scripts
```

このプロジェクトで特に不足しているものは次です。

```text
wrangler.toml / wrangler.jsonc
Cloudflare Workers 用 entrypoint
D1 binding 設定
D1 migrations ディレクトリ
env.DB を使う DB アクセス層
Workers 用 TypeScript 型生成
Cloudflare デプロイ script
MySQL SQL から D1 SQLite 方言への変換方針
Spring Boot API から Hono/Next API への移植単位
```

## 既存構成からの移行メモ

既存バックエンドは Spring Boot + MySQL 前提です。Cloudflare Workers は Java/Spring Boot をそのまま実行する場所ではないため、Workers に載せる API は TypeScript/JavaScript で作り直す必要があります。

D1 は SQLite 系なので、`NEWSQL/` や Flyway migration にある MySQL 方言は見直しが必要です。よく問題になるのは `AUTO_INCREMENT`、`DATETIME`、`BOOLEAN`、文字コード指定、MySQL 固有関数、外部キー制約、ストアド系の処理です。

既存機能のうち、次は Cloudflare 側の別サービス設計が必要です。

```text
ファイル保存       -> R2
非同期ジョブ       -> Queues / Cron Triggers / Workflows
WebSocket/STOMP    -> Durable Objects 等を検討
セッション管理     -> Cookie + JWT / KV / D1 / Durable Objects
メール送信         -> 外部メール API
ログ/監視          -> Workers Logs / Logpush / 外部 APM
```

## 最初に作るならこの形

このリポジトリ直下に追加するなら、まずは次の最小構成がよいです。

```text
.
├── FE/spa-next/my-next-app/
│   └── 既存 Next.js
└── workers/
    └── api/
        ├── package.json
        ├── wrangler.toml
        ├── tsconfig.json
        ├── migrations/
        │   └── 0001_init.sql
        └── src/
            ├── index.ts
            ├── env.ts
            ├── routes/
            │   └── health.ts
            └── db/
                └── d1.ts
```

この形なら、既存 Next.js 側は大きく壊さず、API の移行を `/api/health`、`/api/user/list`、`/api/roles/list` のように小さく進められます。

## 参考公式ドキュメント

- Cloudflare Workers Next.js guide: https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/
- Cloudflare Workers Hono guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/
- Hono Cloudflare Workers guide: https://hono.dev/docs/getting-started/cloudflare-workers
- Cloudflare D1 getting started: https://developers.cloudflare.com/d1/get-started/
- Cloudflare D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/
- Wrangler configuration: https://developers.cloudflare.com/workers/wrangler/configuration/
