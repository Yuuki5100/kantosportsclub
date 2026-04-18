# 実行手順

## 0. リポジトリに移動

```bash
cd /home/{user}/work/common-archetecture
```

## 1. 開発/検証（modern family）

運用原則:

- サービス起動・停止・検証は `docker compose` 定義を正とし、実行入口は `docker/stack.sh` に統一する。
- 直接 `docker run` を増やさず、必要な処理は compose サービス化して `stack.sh` モードから実行する。

既定 family は `modern` です。以下 2 つは同じ意味です。

```bash
bash docker/stack.sh multi-container --logs
bash docker/stack.sh --family modern multi-container --logs
```

`syncconnector` を含める場合:

```bash
bash docker/stack.sh --family modern all-in-one-sync --logs
```

外部APIモック（WireMock）だけを起動する場合:

```bash
bash docker/stack.sh --family modern wiremock --logs
```

セキュリティ検査（Trivy / Gitleaks）:

```bash
bash docker/stack.sh --family modern trivy
bash docker/stack.sh --family modern gitleaks
```

OpenTelemetry Collector + InfluxDB + Grafana + infra exporter（起動 / データ取得）:

```bash
bash docker/stack.sh --family modern otel --logs
bash docker/stack.sh --family modern otel-metrics
```

Grafana（modern）: `http://localhost:${GRAFANA_PORT:-3001}`

集計対象一覧/拡張計画: `DOC/2_DevGuides/2-1_HowToDevelop/05_otel_aggregation_targets.md`

Pact Pilot（Consumer生成 + Provider検証）:

```bash
npm ci --prefix CI/qa/pact
npm run pact:consumer --prefix CI/qa/pact
mvn -f BE/gateway/pom.xml -Dtest=apigateway.pact.GatewayPactProviderVerificationTest test
```

## 2. 分割起動（instance1 / instance2 / instance3）

env ファイル作成:

```bash
cp docker/env/instance1.env.example docker/env/instance1.env
cp docker/env/instance2.env.example docker/env/instance2.env
cp docker/env/instance3.env.example docker/env/instance3.env
```

起動:

```bash
bash docker/stack.sh --family modern instance1-sync docker/env/instance1.env --logs
bash docker/stack.sh --family modern instance2 docker/env/instance2.env --logs
bash docker/stack.sh --family modern instance3 docker/env/instance3.env --logs
```

## 3. 系統切替（csharp / java-legacy）

`csharp` は .NET 8 SDK テンプレート、`java-legacy` は Apache + Tomcat の分離テンプレートです。
いずれも現時点の推奨モードは `up` / `status` / `logs` / `down` / `down-v` です。
`java-legacy` の標準構成は `Java 1.8.0_202` + `Tomcat 6.0.43` です。

family 切替前に、既存 family を停止:

```bash
bash docker/stack.sh --family modern down
```

```bash
bash docker/stack.sh --family csharp up
bash docker/stack.sh --family csharp status
bash docker/stack.sh --family csharp down
```

csharp のベースライン:

- `.NET 8 SDK`（`mcr.microsoft.com/dotnet/sdk:8.0`）

```bash
bash docker/stack.sh --family java-legacy up
bash docker/stack.sh --family java-legacy status
bash docker/stack.sh --family java-legacy down
```

java-legacy の OTel 監視導線（metrics）:

```bash
bash docker/stack.sh --family java-legacy otel --logs
bash docker/stack.sh --family java-legacy otel-metrics
```

java-legacy の既定ポート:

- Apache: `http://localhost:8088`（`JAVA_LEGACY_APACHE_PORT` で変更可）
- Tomcat: `http://localhost:18080`（`JAVA_LEGACY_TOMCAT_PORT` で変更可）

java-legacy の事前準備:

- `docker/java-legacy/assets/` に JDK tarball（推奨: `jdk-8u202-linux-x64.tar.gz`）を配置
- 必要に応じて `6.zip`（Tomcat 一式）を同ディレクトリへ配置
- 参照: `docker/java-legacy/assets/README.md`

## 4. 状態確認

```bash
bash docker/stack.sh --family modern status
```

## 5. 停止

```bash
bash docker/stack.sh --family modern down
bash docker/stack.sh --family modern down-v
```

## 6. 運用ルール

- family は当面、排他的に運用する（同時起動しない）
- `--family` 未指定時は `modern` が選択される
- 環境変数 `STACK_FAMILY` でも既定 family を切替可能（`--family` を優先）

## 7. 参照先

- Docker 詳細ガイド: [../../../docker/README.md](../../../docker/README.md)
- Dev Container アーキテクチャ: [./04_devcontainer_architecture.md](./04_devcontainer_architecture.md)
- 現行環境方針: [./開発環境.md](./開発環境.md)
- 拡張計画/採用判断: [./ドッカー拡張計画.md](./ドッカー拡張計画.md)
- all-in-one ログチートシート: [../../../docker/CHEATSHEET_ALL_IN_ONE.md](../../../docker/CHEATSHEET_ALL_IN_ONE.md)
- 分割起動ログチートシート: [../../../docker/CHEATSHEET_MULTI_INSTANCE.md](../../../docker/CHEATSHEET_MULTI_INSTANCE.md)
