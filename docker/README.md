# Docker 実行ガイド（モード切替対応）

このガイドは、以下を切り替えられるようにした Docker 構成です。

- 本番構成: `instance1`（appserver + gateway + optional syncconnector）, `instance2`（batchserver）, `instance3`（frontend on nginx static）
- 開発/検証構成: `multi-container`（現行の分離起動。`all-in-one` は互換 alias）
- 開発標準化: `Dev Container` + `.mise.toml`
- 品質検証: `frontend-test` / `backend-test` / `e2e` / `k6` / `OWASP ZAP`

## 前提

- Docker Engine 起動済み
- Docker Compose V2 (`docker compose`) が利用可能
- 実行位置がプロジェクトルート
- サービス起動・停止・データ取得は `docker compose` 定義を正とし、実行入口は `docker/stack.sh` を標準とする
- `frontend` 系サービス、`test-fe`、`instance3-dev`、`zap-frontend-build` は `frontend/Dockerfile` / `docker/compose.base.yml` / `docker/compose.family.modern.yml` / `docker/stack.sh` を通じて `FE/spa-next/my-next-app` を前提にしている
- FE 構成整理では、Docker / CI / 開発手順の参照更新と再検証をまとめて扱う専用タスクを切らない限り、`FE/spa-next/my-next-app` は移設対象外とする

タイムゾーン方針（開発環境）:

- Dev Container / Docker Compose サービスは `TZ=Asia/Tokyo` に統一
- MySQL は `--default-time-zone=+09:00` を設定
- Java 系コンテナは `-Duser.timezone=Asia/Tokyo` を設定

```bash
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"
cd "$PROJECT_ROOT"
echo "PROJECT_NAME=$PROJECT_NAME"
```

## ログ運用チートシート

- multi-container / all-in-one 起動向け: [CHEATSHEET_ALL_IN_ONE.md](CHEATSHEET_ALL_IN_ONE.md)
- 分割起動（instance1/2/3）向け: [CHEATSHEET_MULTI_INSTANCE.md](CHEATSHEET_MULTI_INSTANCE.md)
- テストフェーズ向け: [CHEATSHEET_TEST_PHASE.md](CHEATSHEET_TEST_PHASE.md)

## DOC 連携（往復導線）

- 実行時の family 運用ルール（正本）: [../DOC/2_DevGuides/2-1_HowToDevelop/03_run_guide.md](../DOC/2_DevGuides/2-1_HowToDevelop/03_run_guide.md)
- 現行環境方針: [../DOC/2_DevGuides/2-1_HowToDevelop/開発環境.md](../DOC/2_DevGuides/2-1_HowToDevelop/開発環境.md)
- Dev Container 構成と機能一覧: [../DOC/2_DevGuides/2-1_HowToDevelop/04_devcontainer_architecture.md](../DOC/2_DevGuides/2-1_HowToDevelop/04_devcontainer_architecture.md)
- OTel 集計対象一覧/拡張計画: [../DOC/2_DevGuides/2-1_HowToDevelop/05_otel_aggregation_targets.md](../DOC/2_DevGuides/2-1_HowToDevelop/05_otel_aggregation_targets.md)
- 拡張計画/採用判断: [../DOC/2_DevGuides/2-1_HowToDevelop/ドッカー拡張計画.md](../DOC/2_DevGuides/2-1_HowToDevelop/ドッカー拡張計画.md)

## チーム共通の開発環境

### Dev Container

以下を追加しました。

- `.devcontainer/devcontainer.json`
- `.devcontainer/docker-compose.yml`
- `.devcontainer/Dockerfile`
- `.devcontainer/post-create.sh`

構成の全体像と機能一覧は、[../DOC/2_DevGuides/2-1_HowToDevelop/04_devcontainer_architecture.md](../DOC/2_DevGuides/2-1_HowToDevelop/04_devcontainer_architecture.md) を参照してください。

VS Code でリポジトリを開き、`Reopen in Container` を選ぶと、Node.js 24.14.0 / Java 21 / Docker CLI / AWS CLI / GitLab CLI (`glab`) を含む共通開発環境を起動できます。

PlantUML サーバーも同時に立ち上がり、`http://localhost:8082` で利用できます。

導入済み CLI の確認:

```bash
aws --version
glab --version
python3 --version
mvn --version
```

認証情報はイメージに含めません。各自のアカウントで設定してください。

```bash
aws configure
glab auth login
```

Dev Container 定義更新後は、VS Code で `Dev Containers: Rebuild Container` を実行して反映してください。

`post-create.sh` では、frontend に加えて backend の `*/target` 配下も所有者を補正してから Maven 初期化を実行します。

バージョン方針:

- Node.js: `24.14.0`（Dev Container / frontend Dockerfile / GitLab frontend jobs）
- `nvm` は不採用（Dockerfile 固定版との二重管理を避けるため）
- Maven: `3.9.9`（backend Dockerfile / GitLab backend jobs）
- Playwright image はブラウザ同梱互換性のため `mcr.microsoft.com/playwright:v1.58.2-*` を維持

### mise

プロジェクトルートに `.mise.toml` を追加しています。

```bash
mise install
```

で Node.js / Java のバージョンをそろえられます。

## 切替コマンド

`docker/stack.sh` でモード切替できます。

```bash
docker/stack.sh [--family <name>] <mode> [env-file]
```

ログ自動追従つきで起動する場合:

```bash
docker/stack.sh [--family <name>] <mode> [env-file] --logs
docker/stack.sh [--family <name>] <mode> [env-file] --logs=tmux
```

テスト/検証コマンド例:

```bash
docker/stack.sh test-fe
docker/stack.sh test-be
docker/stack.sh e2e
docker/stack.sh newman
docker/stack.sh wiremock
docker/stack.sh otel
docker/stack.sh otel-metrics
docker/stack.sh trivy
docker/stack.sh gitleaks
docker/stack.sh python
docker/stack.sh python-sync
docker/stack.sh k6
docker/stack.sh zap-smoke
docker/stack.sh zap-baseline
```

モード一覧:

- family の既定は `modern`。
- `--family csharp` は .NET 8 SDK テンプレートを提供（推奨モードは `up` / `status` / `logs` / `down` / `down-v`）。
- `--family java-legacy` は Apache + Tomcat（Java `1.8.0_202` / Tomcat `6.0.43`）の分離テンプレートを提供（推奨モードは `up` / `status` / `logs` / `down` / `down-v`）。
- family は当面「排他的運用」（同時起動しない）を前提とする。
- `up`: 選択された family compose のデフォルトサービスを起動
- `multi-container`: `mysql + redis + minio + appserver + gateway + batchserver + frontend`
- `all-in-one`: `multi-container` の互換 alias
- `all-in-one-sync`: `all-in-one + syncconnector`
- `instance1`: `backend(appserver) + gateway` を起動（`--no-deps`）
- `instance1-sync`: `instance1 + syncconnector` を起動（`--no-deps`）
- `instance2`: `batchserver` を起動（`--no-deps`）
- `instance3`: `frontend-static(nginx)` を起動（`--no-deps`）
- `instance3-dev`: `frontend(Next.js dev)` を起動（`--no-deps`）
- `cloudfront-export`: CloudFront/S3 配信用の静的成果物を `dist/frontend-static` に出力
- `test-fe`: frontend の `lint + jest --coverage` を Docker 内で実行
- `test-be`: backend の Maven テストを Docker 内で実行
- `e2e`: smoke テスト実行
- `newman`: Postman Collection を Newman で実行し `dist/newman/` にレポートを出力
- `wiremock`: 外部APIモック用の WireMock を起動（`http://localhost:${WIREMOCK_PORT:-18089}`）
- `otel`: OpenTelemetry Collector + InfluxDB を起動（`modern` は Grafana + infra exporter も起動、`java-legacy` は legacy監視導線を起動）
- `otel-metrics`: OpenTelemetry Collector の metrics を取得し `dist/otel/collector-metrics.prom` に保存
- `trivy`: Trivy ファイルシステムスキャンを実行し `dist/security/trivy-fs.json` を出力
- `gitleaks`: Gitleaks シークレットスキャンを実行し `dist/security/gitleaks.sarif` を出力
- `python`: `python-tools` コンテナの既定コマンド（`uv run python --version`）を実行
- `python-lock`: `uv lock` を実行して Python 依存 lock を更新
- `python-sync`: Python 依存を同期（`uv.lock` あり: `uv sync --frozen` / なし: `uv sync`）
- `k6`: k6 によるスモーク負荷試験を実行し `dist/k6/summary.json` を出力
- `zap-smoke`: ZAP spider 1分の短時間スキャンを実行し `dist/zap/` にレポートを出力
- `zap-baseline`: OWASP ZAP baseline scan を実行し `dist/zap/` にレポートを出力
- `zap-frontend-build`: ZAP用 `frontend-zap` の `.next` ビルドキャッシュを `dist/frontend-zap/.next` に再生成
- `seed-data`: MySQL/MinIO の共通 QA seed を再投入
- `status`: 状態確認
- `logs`: 主要サービスログ表示
- `down`: 停止/削除
- `down-v`: 停止/削除 + volume 初期化

ログオプション:

- `--logs`: 起動後に対象サービスログを 1 つのターミナルで追従
- `--logs=combined`: `--logs` と同じ
- `--logs=tmux`: サービスごとに tmux ウィンドウを作成してログ追従
- `--no-logs`: 環境変数で自動ログ有効化していても無効化

環境変数:

- `STACK_AUTO_LOGS=1`: 起動後ログ追従を常時有効化
- `STACK_LOG_VIEWER=combined|tmux`: ログ表示方式
- `STACK_TMUX_SESSION_PREFIX=<prefix>`: tmux セッション名プレフィックス
- `STACK_FAMILY=modern`: `--family` 省略時の既定 family
- `COMPOSE_FILE=/path/to/file.yml`: family 自動選択を無効化して単一 compose を強制
- `NEWMAN_COLLECTION`: Collection パス（既定: `/etc/newman/smoke.postman_collection.json`）
- `NEWMAN_ENVIRONMENT`: Environment パス（任意）
- `NEWMAN_BASE_URL`: Newman が接続する API ベースURL（例: `http://gateway:8888`）
- `NEWMAN_LOGIN_USER_ID`: 認証トークン取得用ログインID
- `NEWMAN_LOGIN_PASSWORD`: 認証トークン取得用ログインパスワード
- `NEWMAN_AUTH_LOGIN_USER_ID_KEY`: ログイン body のユーザーIDキー（既定: `user_id`）
- `NEWMAN_AUTH_LOGIN_PASSWORD_KEY`: ログイン body のパスワードキー（既定: `password`）
- `NEWMAN_AUTH_LOGIN_PATH`: ログイン API パス（既定: `/api/auth/login`）
- `NEWMAN_AUTH_STATUS_PATH`: 認証状態確認 API パス（既定: `/api/auth/status`）
- `NEWMAN_AUTH_TOKEN_COOKIE_NAME`: トークン抽出対象 Cookie 名（既定: `ACCESS_TOKEN`）
- `NEWMAN_REPORT_JSON`: JSON レポート出力先（既定: `/reports/newman-report.json`）
- `NEWMAN_REPORT_JUNIT`: JUnit レポート出力先（既定: `/reports/newman-report.xml`）
- `WIREMOCK_PORT`: WireMock 公開ポート（既定: `18089`）
- `OTEL_COLLECTOR_GRPC_PORT`: OTel Collector gRPC 公開ポート（既定: `4317`）
- `OTEL_COLLECTOR_HTTP_PORT`: OTel Collector HTTP 公開ポート（既定: `4318`）
- `OTEL_COLLECTOR_PROM_PORT`: OTel Collector metrics 公開ポート（既定: `9464`）
- `INFLUXDB_PORT`: InfluxDB 公開ポート（既定: `8086`）
- `INFLUXDB_DB`: InfluxDB 初期 DB 名（既定: `ci_metrics`）
- `INFLUXDB_ADMIN_USER`: InfluxDB 管理ユーザー（既定: `admin`）
- `INFLUXDB_ADMIN_PASSWORD`: InfluxDB 管理パスワード（既定: `adminpass`）
- `GRAFANA_PORT`: Grafana 公開ポート（既定: `3001`）
- `GRAFANA_ADMIN_USER`: Grafana 管理ユーザー（既定: `admin`）
- `GRAFANA_ADMIN_PASSWORD`: Grafana 管理パスワード（既定: `admin`）
- `OTEL_METRICS_ENDPOINT`: `otel-metrics` が取得する endpoint（既定: `http://otel-collector:9464/metrics`）
- `OTEL_INTERNAL_METRICS_ENDPOINT`: primary が空応答時の fallback endpoint（既定: `http://otel-collector:8888/metrics`）
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`: backend/gateway/batchserver/syncconnector の traces 送信先（既定: `http://otel-collector:4318/v1/traces`）
- `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`: backend/gateway/batchserver/syncconnector の metrics 送信先（既定: `http://otel-collector:4318/v1/metrics`）
- `OTEL_TRACING_ENABLED`: backend/gateway/batchserver/syncconnector の tracing export 有効化（既定: `true`）
- `OTEL_METRICS_EXPORT_ENABLED`: backend/gateway/batchserver/syncconnector の metrics export 有効化（既定: `true`）
- `OTEL_TRACING_SAMPLING_PROBABILITY`: tracing サンプリング率（既定: `1.0`）
- `OTEL_METRICS_EXPORT_STEP`: metrics 送信間隔（既定: `30s`）
- `MYSQL_EXPORTER_USER`: `mysqld-exporter` の接続ユーザー（既定: `root`）
- `MYSQL_EXPORTER_PASSWORD`: `mysqld-exporter` の接続パスワード（既定: `root`）
- `NEXT_PUBLIC_OTEL_TRACEPARENT_ENABLED`: frontend の `traceparent` ヘッダ付与有効化（既定: `true`）
- `NEXT_PUBLIC_OTEL_WEB_VITALS_ENABLED`: frontend の Web Vitals OTLP 送信有効化（既定: `true`）
- `NEXT_PUBLIC_OTEL_SERVICE_NAME`: frontend 側 OTEL `service.name`（既定: `frontend`）
- `NEXT_PUBLIC_OTEL_HTTP_ENDPOINT`: frontend が送信する OTLP HTTP endpoint（既定: `http://localhost:4318`）
- `TRIVY_SEVERITY`: Trivy severity フィルタ（既定: `HIGH,CRITICAL`）
- `TRIVY_TIMEOUT`: Trivy タイムアウト（既定: `10m`）
- `TRIVY_EXIT_CODE`: Trivy 検出時の終了コード（既定: `1`）
- `TRIVY_TARGET_DIR`: Trivy 対象パス（既定: `/workspace`）
- `GITLEAKS_EXIT_CODE`: Gitleaks 検出時の終了コード（既定: `1`）
- `GITLEAKS_SOURCE_DIR`: Gitleaks 対象パス（既定: `.`）

## 使い方

### 1) 開発/検証（multi-container / all-in-one）

```bash
docker/stack.sh multi-container
docker/stack.sh status
```

期待値:

- `backend`: `Up ... (healthy)`
- `gateway`: `Up ... (healthy)`
- `batchserver`: `Up ... (healthy)` または起動中
- `frontend`: `Up ... (healthy)`
- `mysql`, `redis`, `minio`: `Up ... (healthy)`
- `minio-init`: `Exited (0)`

### 1.1) Docker 内でのテスト実行

frontend lint + unit test:

```bash
docker/stack.sh test-fe
```

backend test:

```bash
docker/stack.sh test-be
```

`test-be` は `LOCAL_UID` / `LOCAL_GID` を自動反映して非 root で実行し、Maven キャッシュを `dist/backend-test-home/.m2` に保存します。

権限不整合で再実行したい場合:

```bash
rm -rf dist/backend-test-home
docker/stack.sh test-be
```

backend ビルドを手元で再利用する場合は、共通ラッパーを使ってください（先に `install-local-libs` を実行します）。

```bash
BE/scripts/build-backend.sh
BE/scripts/build-backend.sh -pl appserver,gateway,batchserver,syncconnector -am test
```

E2E smoke:

```bash
docker/stack.sh e2e
```

### 1.2) API テスト（Newman）

既定 Collection（`CI/qa/postman/smoke.postman_collection.json`）を実行:

```bash
NEWMAN_BASE_URL=http://gateway:8888 \
NEWMAN_LOGIN_USER_ID=<user_id> \
NEWMAN_LOGIN_PASSWORD=<password> \
docker/stack.sh newman
```

Environment を指定する場合:

```bash
NEWMAN_BASE_URL=http://gateway:8888 \
NEWMAN_LOGIN_USER_ID=<user_id> \
NEWMAN_LOGIN_PASSWORD=<password> \
NEWMAN_AUTH_LOGIN_USER_ID_KEY=user_id \
NEWMAN_AUTH_LOGIN_PASSWORD_KEY=password \
NEWMAN_ENVIRONMENT=/etc/newman/local.postman_environment.json \
docker/stack.sh newman
```

レポートは `dist/newman/` に出力されます。

### 1.3) 外部APIモック（WireMock）

起動:

```bash
docker/stack.sh wiremock
```

疎通確認（正常系）:

```bash
curl -sS http://localhost:${WIREMOCK_PORT:-18089}/external/health
```

疎通確認（異常系）:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
  "http://localhost:${WIREMOCK_PORT:-18089}/external/health?mode=error"
```

マッピング配置先:

- `docker/wiremock/mappings`
- `docker/wiremock/__files`

### 1.4) OpenTelemetry Collector + InfluxDB + Grafana（monitoring）

起動:

```bash
docker/stack.sh otel
```

metrics 取得（Prometheus 形式）:

```bash
docker/stack.sh otel-metrics
```

取得結果は `dist/otel/collector-metrics.prom` に保存されます。
アプリ側の OTLP 送信が未設定の場合は、プレースホルダー行のみ出力されます。

Grafana（modern family, monitoring 起動後）:

- URL: `http://localhost:${GRAFANA_PORT:-3001}`
- User: `${GRAFANA_ADMIN_USER:-admin}`
- Password: `${GRAFANA_ADMIN_PASSWORD:-admin}`
- 初期ダッシュボード: `Modern Observability Overview`（provisioning 済み）
- 実行ユーザー: `472:472`（`docker/stack.sh otel` 実行時に `dist/monitoring/grafana` の所有権を自動調整）

InfluxDB 側の確認（monitoring プロファイル起動後）:

```bash
docker compose -f docker/compose.base.yml -f docker/compose.family.modern.yml -f docker/compose.yml \
  --profile monitoring exec influxdb \
  influx -username "${INFLUXDB_ADMIN_USER:-admin}" -password "${INFLUXDB_ADMIN_PASSWORD:-adminpass}" \
  -execute 'SHOW DATABASES'
```

### 1.5) セキュリティ検査（Trivy / Gitleaks）

```bash
docker/stack.sh trivy
docker/stack.sh gitleaks
```

出力先:

- `dist/security/trivy-fs.json`
- `dist/security/gitleaks.sarif`

例（警告運用で実行）:

```bash
TRIVY_EXIT_CODE=0 docker/stack.sh trivy
GITLEAKS_EXIT_CODE=0 docker/stack.sh gitleaks
```

### 1.6) Python ツールコンテナ（uv）

```bash
docker/stack.sh python
docker/stack.sh python-lock
docker/stack.sh python-sync
```

`python-sync` は `TOOL/python/uv.lock` がある場合に `uv sync --frozen` を使い、
未作成の場合は初回生成のため `uv sync` を実行します。

### 1.7) 非機能テストの土台

k6 smoke load test:

```bash
docker/stack.sh k6
```

必要に応じて以下を上書きできます。

```bash
K6_TARGET_URL=http://gateway:8888/ K6_VUS=20 K6_DURATION=1m docker/stack.sh k6
```

OWASP ZAP baseline scan:

```bash
docker/stack.sh zap-smoke
docker/stack.sh zap-baseline
```

`zap-smoke` は `ZAP_SPIDER_MINUTES=1` 相当の短時間確認、`zap-baseline` は `ZAP_SPIDER_MINUTES=3` 既定の通常確認です。

`docker/stack.sh zap-baseline` は、CSP 検証のために自動で以下を付与します。

- `CSP_DISABLE_UNSAFE_EVAL=1`
- `CSP_DISABLE_UNSAFE_INLINE=1`

通常の開発実行（`multi-container` / `all-in-one` / `instance3-dev`）では `0` のままにしてください。

補足:

- `frontend-zap` の production build 成果物は `dist/frontend-zap/.next` にキャッシュし、`FE/spa-next/my-next-app` / `frontend/Dockerfile` / `docker/compose.yml` に変更がない限り再利用します。
- キャッシュを明示的に作り直す場合は `docker/stack.sh zap-frontend-build` を実行してください。
- ZAP は `WARN-NEW` があると終了コード `2` になります（例: `Vulnerable JS Library [10003]`）。
- 判定ルールは `docker/zap/zap-baseline.conf` で管理し、CI (`zap-baseline-scan`) と同一設定を使います。

必要に応じて以下を上書きできます。

```bash
ZAP_TARGET_URL=http://frontend:3000 ZAP_SPIDER_MINUTES=5 docker/stack.sh zap-baseline
```

### 1.7) テストデータ seed の統一

テストデータ仕様は [TEST_DATA_SEED_SPEC.md](TEST_DATA_SEED_SPEC.md) を参照してください。

新規 volume で再現する場合:

```bash
docker/stack.sh down-v
docker/stack.sh multi-container
```

既存 volume に seed を再投入する場合:

```bash
docker/stack.sh seed-data
```

`seed-data` は以下を反映します。

- MySQL: `qa_seed_accounts`, `qa_seed_targets`
- MinIO: `app-bucket/seed/qa-targets.json`, `qa-evidence` bucket

CI で最低限必要な Variables:

- `E2E_BASE_URL`
- `NEWMAN_BASE_URL`
- `NEWMAN_COLLECTION`（既定: `CI/qa/postman/smoke.postman_collection.json`）
- `NEWMAN_ENVIRONMENT`（任意）
- `NEWMAN_LOGIN_USER_ID`（機密値は GitLab Variables）
- `NEWMAN_LOGIN_PASSWORD`（機密値は GitLab Variables）
- `NEWMAN_AUTH_LOGIN_USER_ID_KEY`（既定: `user_id`）
- `NEWMAN_AUTH_LOGIN_PASSWORD_KEY`（既定: `password`）
- `NEWMAN_AUTH_LOGIN_PATH`（既定: `/api/auth/login`）
- `NEWMAN_AUTH_STATUS_PATH`（既定: `/api/auth/status`）
- `NEWMAN_AUTH_TOKEN_COOKIE_NAME`（既定: `ACCESS_TOKEN`）
- `PACT_VERIFY`（`true` で `pact-consumer-generate` / `pact-provider-verify` を有効化）
- `PACT_ENFORCE`（`true` の場合は provider 検証失敗で fail）
- `PACT_PUBLIC_SAMPLES`（`true` で `pact-public-samples-generate` / `pact-public-samples-provider-verify` を有効化）
- `PACT_PUBLIC_SAMPLES_ENFORCE`（`true` の場合は public sample provider 検証失敗で fail）
- `TRIVY_SCAN`（`true` で `trivy-scan` を有効化）
- `TRIVY_TARGET_DIR`（既定: `.`）
- `TRIVY_SEVERITY`（既定: `HIGH,CRITICAL`）
- `TRIVY_TIMEOUT`（既定: `10m`）
- `TRIVY_ENFORCE`（`true` の場合は検出で fail）
- `GITLEAKS_SCAN`（`true` で `gitleaks-scan` を有効化）
- `GITLEAKS_ENFORCE`（`true` の場合は検出で fail）
- `K6_TARGET_URL`
- `ZAP_TARGET_URL`
- （認証連携時のみ）`IT_USER_ID`, `IT_USER_PASSWORD` ほか

### 2) 本番構成に合わせた起動（分離実行）

`env` はテンプレートから作成してください。

- `docker/env/instance1.env.example`
- `docker/env/instance2.env.example`
- `docker/env/instance3.env.example`

例:

```bash
cp docker/env/instance1.env.example docker/env/instance1.env
cp docker/env/instance2.env.example docker/env/instance2.env
cp docker/env/instance3.env.example docker/env/instance3.env
```

instance 1（appserver + gateway）:

```bash
docker/stack.sh instance1 docker/env/instance1.env
```

instance 1（appserver + gateway + syncconnector option）:

```bash
docker/stack.sh instance1-sync docker/env/instance1.env
```

instance 2（batchserver）:

```bash
docker/stack.sh instance2 docker/env/instance2.env
```

instance 3（frontend static on nginx）:

```bash
docker/stack.sh instance3 docker/env/instance3.env
```

instance 3（frontend dev server）:

```bash
docker/stack.sh instance3-dev docker/env/instance3.env
```

### 2.1) Java legacy family（Apache + Tomcat）

family 切替前に、既存 family を停止してください。

```bash
docker/stack.sh --family modern down
```

```bash
docker/stack.sh --family java-legacy up
docker/stack.sh --family java-legacy status
```

OTel 監視導線（metrics）を起動する場合:

```bash
docker/stack.sh --family java-legacy otel
docker/stack.sh --family java-legacy otel-metrics
```

既定ポート:

- Apache: `http://localhost:8088`（`JAVA_LEGACY_APACHE_PORT` で変更可）
- Tomcat: `http://localhost:18080`（`JAVA_LEGACY_TOMCAT_PORT` で変更可）

Java ベースライン:

- `Java 1.8.0_202`（`docker/java-legacy/assets/` に配置した JDK tarball を利用）
- `Apache Tomcat 6.0.43`（archive.apache.org から build 時に取得）

事前準備:

- `docker/java-legacy/assets/` に JDK tarball を配置（推奨: `jdk-8u202-linux-x64.tar.gz`）
- 必要に応じて `6.zip`（Tomcat 一式）を同ディレクトリへ配置
- 詳細: `docker/java-legacy/assets/README.md`

配備先:

- WAR / exploded app: `dist/java-legacy/tomcat/webapps/`
- Apache 静的ファイル: `dist/java-legacy/apache/htdocs/`

詳細は [java-legacy/README.md](java-legacy/README.md) を参照してください。

### 2.2) C# family（.NET 8 SDK）

family 切替前に、既存 family を停止してください。

```bash
docker/stack.sh --family modern down
```

```bash
docker/stack.sh --family csharp up
docker/stack.sh --family csharp status
```

SDK 確認:

```bash
docker compose --project-name jems-dev-csharp \
  -f docker/compose.base.yml -f docker/compose.family.csharp.yml \
  exec -T csharp-sdk dotnet --info
```

詳細は [csharp/README.md](csharp/README.md) を参照してください。

## 本番3インスタンス分割運用手順（stack.sh）

この章は、以下の 3 台に分割して運用する前提の手順です。

- instance1: `appserver + gateway (+ optional syncconnector)`
- instance2: `batchserver`
- instance3: `frontend-static(nginx)`

### 1) 初回準備（各インスタンス）

```bash
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"
cd "$PROJECT_ROOT"
echo "PROJECT_NAME=$PROJECT_NAME"
cp docker/env/instance1.env.example docker/env/instance1.env
cp docker/env/instance2.env.example docker/env/instance2.env
cp docker/env/instance3.env.example docker/env/instance3.env
```

`*.env` の接続先を実環境値に更新してください。

- DB / MinIO / Redis の接続先
- `FRONTEND_ORIGIN`, `APP_LOGIN_URL`
- `NEXT_PUBLIC_API_BASE_URL`（ブラウザから到達可能な API エンドポイント）
- `CSP_DISABLE_UNSAFE_EVAL`, `CSP_DISABLE_UNSAFE_INLINE`（通常は `0`、セキュリティ検証時のみ `1`）

### 2) 起動順序（推奨）

1. instance1 を起動

```bash
docker/stack.sh instance1 docker/env/instance1.env
```

syncconnector を使う場合:

```bash
docker/stack.sh instance1-sync docker/env/instance1.env
```

2. instance2 を起動

```bash
docker/stack.sh instance2 docker/env/instance2.env
```

3. instance3 を起動

```bash
docker/stack.sh instance3 docker/env/instance3.env
```

### 3) 起動確認

```bash
docker/stack.sh status docker/env/instance1.env
docker/stack.sh status docker/env/instance2.env
docker/stack.sh status docker/env/instance3.env
```

期待値:

- `backend`, `gateway`, `batchserver`, `frontend-static` が `Up ... (healthy)`
- `syncconnector` を使う場合は `Up ... (healthy)`

### 4) 更新反映（再デプロイ）

instance1:

```bash
docker compose --env-file docker/env/instance1.env -f docker/compose.yml up -d --build --no-deps backend gateway
```

instance1 + syncconnector:

```bash
docker compose --env-file docker/env/instance1.env -f docker/compose.yml --profile syncconnector up -d --build --no-deps backend gateway syncconnector
```

instance2:

```bash
docker compose --env-file docker/env/instance2.env -f docker/compose.yml up -d --build --no-deps batchserver
```

instance3:

```bash
docker compose --env-file docker/env/instance3.env -f docker/compose.yml up -d --build --no-deps frontend-static
```

### 5) ログ確認

全体ログ（主要サービス）:

```bash
docker/stack.sh logs docker/env/instance1.env
docker/stack.sh logs docker/env/instance2.env
docker/stack.sh logs docker/env/instance3.env
```

全体ログ（全サービス、追従）:

```bash
docker compose --env-file docker/env/instance1.env -f docker/compose.yml --profile syncconnector logs -f
```

直近ログだけ確認（追従なし）:

```bash
docker compose --env-file docker/env/instance1.env -f docker/compose.yml --profile syncconnector logs --tail=200
```

サービス別ログ（テンプレート）:

```bash
docker compose --env-file <env-file> -f docker/compose.yml --profile syncconnector logs -f <service>
```

サービス別ログ（例）:

```bash
# instance1 系
docker compose --env-file docker/env/instance1.env -f docker/compose.yml --profile syncconnector logs -f backend
docker compose --env-file docker/env/instance1.env -f docker/compose.yml --profile syncconnector logs -f gateway
docker compose --env-file docker/env/instance1.env -f docker/compose.yml --profile syncconnector logs -f syncconnector

# instance2 系
docker compose --env-file docker/env/instance2.env -f docker/compose.yml logs -f batchserver

# instance3 系
docker compose --env-file docker/env/instance3.env -f docker/compose.yml logs -f frontend-static
docker compose --env-file docker/env/instance3.env -f docker/compose.yml logs -f frontend

# infra
docker compose --env-file docker/env/instance1.env -f docker/compose.yml logs -f mysql
docker compose --env-file docker/env/instance1.env -f docker/compose.yml logs -f redis
docker compose --env-file docker/env/instance1.env -f docker/compose.yml logs -f minio
docker compose --env-file docker/env/instance1.env -f docker/compose.yml logs -f minio-init
```

### E2E（smoke）

```bash
docker/stack.sh e2e
```

期待値:

- ログに `1 passed`
- 終了コード `0`

### CloudFront / S3 配信用の静的成果物出力

`NEXT_PUBLIC_API_BASE_URL` を CloudFront から到達可能な API ドメインに設定した env を使って実行します。

```bash
docker/stack.sh cloudfront-export docker/env/instance3.env
```

出力先:

- `dist/frontend-static/`（この配下を S3 に配置し、CloudFront 配信）

## フロントエンドのビルド切替手順（デプロイ方式別）

`stack.sh` のモードで、フロントエンドのビルド方式を切り替えます。

### 方式A: instance3 で nginx 静的配信（Dockerコンテナ配信）

用途:

- 本番の instance3 構成（nginx で静的配信）

実行:

```bash
docker/stack.sh instance3 docker/env/instance3.env
```

ポイント:

- `frontend-static` サービスを起動します。
- Docker イメージ内で Next.js を静的 export して nginx で配信します。
- `docker/env/instance3.env` の `NEXT_PUBLIC_API_BASE_URL` を API の公開 URL に設定してください。

### 方式B: CloudFront/S3 静的配信（成果物エクスポート）

用途:

- CloudFront + S3 で静的ホスティングする本番構成

実行:

```bash
docker/stack.sh cloudfront-export docker/env/instance3.env
```

成果物:

- `dist/frontend-static/`

その後の配備例:

```bash
aws s3 sync dist/frontend-static s3://<your-bucket> --delete
aws cloudfront create-invalidation --distribution-id <your-distribution-id> --paths "/*"
```

### 方式C: instance3-dev（Next.js 開発サーバー）

用途:

- 開発時のホットリロード確認

実行:

```bash
docker/stack.sh instance3-dev docker/env/instance3.env
```

### 切替時の注意

- `instance3` / `cloudfront-export` は静的 export 方式です（`NEXT_OUTPUT_MODE=export`）。
- 静的 export では Next.js の `rewrites` / `headers` は適用されません（警告ログは想定）。
- 開発時に `rewrites` / `headers` を使う場合は `instance3-dev` を使ってください。

## 停止/初期化

```bash
docker/stack.sh down
docker/stack.sh down-v
```

## 補足

- 初回は Maven / npm 依存取得で時間がかかります。
- `backend` のヘルスチェックは `/actuator/health` の `200` または `401` を正常扱いにしています。
- `syncconnector` は compose 上でオプション起動（profile: `syncconnector`）です。
- `instance3` / `cloudfront-export` は `NEXT_OUTPUT_MODE=export` で静的化します。Next.js の `rewrites/headers` 非適用警告は仕様上の想定ログです。
- 静的配信用ビルドは成果物生成を優先し、lint/type チェックは export モード時のみスキップします（通常開発モードは従来どおり）。
- ST 証跡を GitLab artifacts で長期保管する場合は `ST_EVIDENCE_ARCHIVE=true` を有効化し、`qa-evidence-archive` job の成果物（90 days）を利用してください。
