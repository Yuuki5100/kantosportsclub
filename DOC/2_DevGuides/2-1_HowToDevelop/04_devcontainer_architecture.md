# Dev Container アーキテクチャと機能一覧

## 1. 目的

この Dev Container は、開発者ごとの差異を減らし、以下を同一コンテナ上で再現できるようにするための共通開発基盤です。

- フロントエンド/バックエンドの開発・ビルド・テスト
- Docker ベースのローカル検証
- 図表作成（PlantUML）
- AWS/GitLab を使う開発オペレーション

## 2. 全体アーキテクチャ

```mermaid
flowchart LR
  VSCode[VS Code Dev Containers] -->|Reopen in Container| WS[workspace service]
  WS -->|bind mount| Repo[/workspace/common-archetecture]
  WS -->|docker.sock mount| HostDocker[Host Docker Engine]
  WS --- Net[devcontainer network]
  Net --- PU[plantuml service]
  User[Browser] -->|http://localhost:8082| PU
```

## 3. 構成ファイルと責務

| ファイル | 役割 |
|---|---|
| `.devcontainer/devcontainer.json` | Dev Container のエントリ定義。利用サービス、`remoteUser`、features、転送ポート、拡張機能、`postCreateCommand` を定義 |
| `.devcontainer/docker-compose.yml` | `workspace` と `plantuml` の 2 サービスを定義。`workspace` はリポジトリ bind mount と `docker.sock` マウントを持つ |
| `.devcontainer/Dockerfile` | `workspace` イメージ拡張。`glab` と `aws` CLI を追加インストール |
| `.devcontainer/post-create.sh` | 初回セットアップ。Git safe.directory 設定、権限補正、frontend の `npm ci`、backend のローカルライブラリ初期化 |

## 4. 含まれる機能群

### 4.1 開発ツールチェーン

- Node.js（Dev Container feature）
- Java（Dev Container feature）
- Maven（Java feature に同梱）
- Docker CLI（docker-outside-of-docker feature）
- Python 3（ベースイメージ）
- AWS CLI v2（`.devcontainer/Dockerfile` で追加）
- GitLab CLI `glab`（`.devcontainer/Dockerfile` で追加）
- Git（`post-create.sh` で `git config --global --add safe.directory` を実行）
- MySQL サービス（`docker/compose.base.yml` の `mysql`）
- MySQL CLI（`docker compose ... exec mysql mysql ...` で利用）
- MinIO サービス（`docker/compose.base.yml` の `minio` / `minio-init`）
- API テスト: Newman（`docker/compose.family.modern.yml` の `newman`）
- API 契約テスト: Pact（`CI/qa/pact` の consumer + `BE/gateway` provider verification）
- 外部APIモック: WireMock（`docker/compose.family.modern.yml` の `wiremock`）
- 観測基盤: OpenTelemetry Collector + InfluxDB + Grafana（`docker/compose.family.modern.yml` の `otel-collector` / `influxdb` / `grafana`）
- backend / gateway は `docker` プロファイルで OTLP 出力（trace + metrics）を有効化
- 集計対象一覧と拡張計画: `05_otel_aggregation_targets.md`
- 脆弱性/設定検査: Trivy（`docker/compose.family.modern.yml` の `trivy`）
- シークレット検査: Gitleaks（`docker/compose.family.modern.yml` の `gitleaks`）
- Python ツールコンテナ: `python-tools` + `uv`（`docker/compose.base.yml`）
- フロントエンド単体テスト: Jest
- バックエンド単体テスト: JUnit
- E2E テスト: Playwright
- 負荷試験: k6（`performance` プロファイル）
- セキュリティ検査: ZAP Baseline（`security` プロファイル、サービス名: `zap-baseline`）


### 4.2 VS Code 開発体験

- Java/Node/YAML/ESLint/Prettier/SonarLint/PlantUML などの拡張機能を自動導入
- `remoteUser: vscode` で統一ユーザー実行
- 改行コード設定 (`files.eol = \n`) を固定

### 4.3 ネットワーク・ポート

- `workspace` と `plantuml` は `devcontainer` ブリッジネットワークに接続
- 主要ポートを forward（`3000`, `8081`, `8888`, `3306`, `9000` など）
- PlantUML サーバーを `http://localhost:8082` で利用可能

### 4.4 初期化と再現性

`post-create.sh` で以下を実施します。

- Git の safe.directory 登録
- frontend 側の root 所有物（`node_modules`, `.next` など）を補正
- backend 側の `*/target` 所有者を補正
- backend の `install-local-libs` を事前実行して Maven 依存初期化を安定化

### 4.5 タイムゾーン統一

- Dev Container の `workspace` / `plantuml` は `TZ=Asia/Tokyo` で統一
- `docker/compose.base.yml` / `docker/compose.family.modern.yml` の全サービスは `TZ=Asia/Tokyo` を明示
- MySQL は `--default-time-zone=+09:00` で JST を使用
- Java サービスは `JAVA_TOOL_OPTIONS` で `-Duser.timezone=Asia/Tokyo` を設定
- アプリの DB 接続設定（`connectionTimeZone=UTC` など）は現行維持（変更対象外）

## 5. テスト・検証実行ガイド（Dev Container）

Dev Container 内の `workspace` から、テスト実行と検証系プロファイル実行をまとめて実施できます。

### 5.1 テスト実行（Jest / JUnit / Playwright）

```bash
# フロントエンド単体テスト（Jest）
docker/stack.sh test-fe

# バックエンド単体テスト（JUnit / Maven）
docker/stack.sh test-be

# E2E テスト（Playwright）
docker/stack.sh e2e
```

### 5.2 検証系プロファイル実行（k6 / ZAP）

- パフォーマンステスト: `k6`（`performance` プロファイル）
- セキュリティ検査: `zap-baseline`（`security` プロファイル）

プロファイルごとの追加サービス（`profiles` 指定あり）:

- `performance`: `k6`
- `security`: `frontend-zap`, `frontend-zap-build`, `zap-baseline`
- `monitoring`: `influxdb`, `grafana`, `otel-collector`, `otel-metrics`

```bash
# k6（性能）
docker/stack.sh k6

# ZAP Baseline（セキュリティ）
docker/stack.sh zap-baseline

# OpenTelemetry Collector + InfluxDB + Grafana（観測）
docker/stack.sh otel
docker/stack.sh otel-metrics
```

注記:

- `docker/compose.yml` は後方互換用に維持しています。
- 今後の系統拡張は `docker/compose.base.yml` + `docker/compose.family.<name>.yml` を正とします。
- family は当面「排他的運用」（同時起動しない）を前提とします。

## 6. 配布運用の前提

- 認証情報（AWS/GitLab トークン）はイメージに含めない
- 各開発者がコンテナ内で個別に認証設定する
  - `aws configure`
  - `glab auth login`
- 定義変更時は `Dev Containers: Rebuild Container` で再作成する

## 7. 代表的な確認コマンド

```bash
aws --version
glab --version
python3 --version
mvn --version
```

## 8. 関連資料

- Docker 運用ガイド: [../../../docker/README.md](../../../docker/README.md)
- 実行手順: [03_run_guide.md](./03_run_guide.md)
- 現行環境方針: [開発環境.md](./開発環境.md)
- 拡張計画/採用判断: [ドッカー拡張計画.md](./ドッカー拡張計画.md)
