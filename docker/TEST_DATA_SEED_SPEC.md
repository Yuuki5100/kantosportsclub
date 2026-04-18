# テストデータ/seed 統一仕様（DOCKER-T08）

## 1. 目的

- ローカル Docker と GitLab CI で、E2E/k6/ZAP の前提データを同じ定義で参照できるようにする。
- 実際の認証情報は Git 管理しない。seed は「参照先キー」と「対象 URL」を統一する。

## 2. seed 対象

### MySQL

- `docker/mysql/initdb.d/02_seed_automation.sql` で以下を初期化する。
- `qa_seed_accounts`: テスト用途アカウントの定義（ID、想定ロール、参照する CI Variables 名）
- `qa_seed_targets`: E2E/k6/ZAP の対象 URL・期待ステータス定義

### MinIO

- `docker/minio/init.sh` で以下を初期化する。
- bucket:
  - `app-bucket`（既存）
  - `qa-evidence`（ST 証跡退避向け）
- object:
  - `app-bucket/seed/qa-targets.json`（E2E/k6/ZAP の対象一覧）

## 3. 投入タイミングとリセット

- 初回投入（volume 新規作成）:
  1. `docker/stack.sh down-v`
  2. `docker/stack.sh all-in-one`
- 既存 volume への再投入:
  - `docker/stack.sh seed-data`

## 4. CI Variables 管理方針

- 必須:
  - `E2E_BASE_URL`
  - `K6_TARGET_URL`
  - `ZAP_TARGET_URL`
- 認証連携を使う場合:
  - `IT_USER_ID`, `IT_USER_PASSWORD`
  - `K6_USER_ID`, `K6_USER_PASSWORD`
  - `ZAP_AUTH_USER_ID`, `ZAP_AUTH_USER_PASSWORD`
- 運用ルール:
  - すべて masked + protected で登録する
  - 値は本番共用しない（検証専用アカウントを分離）
  - 失効/更新時は `qa_seed_accounts` のキー定義のみ維持し、実値は Variables 側を更新する
