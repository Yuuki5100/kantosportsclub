# SonarQube ローカル実行・運用ガイド

本書は、`common-archetecture/TOOL/SonarQube` 配下に配置した SonarQube 一式のローカル実行、レポート生成、運用上の注意点をまとめた手順書です。

本構成は、基盤モジュール本体の標準開発起動フローとは独立した補助ツールとして扱います。

## 1. 目的

本構成の目的は、ローカル環境で以下をまとめて提供することです。

- SonarQube 本体の起動
- SonarQube 用 PostgreSQL の起動
- `SonarHtmlExport.py` を利用した HTML レポート生成 API の提供

想定用途:

- SonarQube 解析結果の画面確認
- 解析済みプロジェクトの HTML レポート出力
- ローカル検証や補助的な品質確認

非対象:

- 基盤モジュール本体の標準起動手順への統合
- `docker/stack.sh` による通常開発フローへの組み込み

## 2. 構成概要

本構成では、以下 3 つのサービスを利用します。

| サービス | 役割 | 備考 |
|---|---|---|
| `sonarqube` | SonarQube サーバー本体 | `http://localhost:9000` |
| `db` | SonarQube 用 PostgreSQL | SonarQube の永続データを保持 |
| `sonar-report-api` | HTML レポート生成 API | `SonarHtmlExport.py` を HTTP 経由で実行 |

接続関係:

- `sonarqube` は `db` に接続してメタデータを保持する
- `sonar-report-api` は `sonarqube` に接続して解析結果を取得する
- `sonar-report-api` は生成した HTML をローカルディレクトリへ保存する

## 3. ディレクトリ構成

```text
common-archetecture/TOOL/SonarQube/
├── docker-compose.yml
├── README.md
└── SonarQubeScriptContainer/
    ├── Dockerfile
    ├── report_api.py
    ├── SonarHtmlExport.py
    ├── requirements.txt
    └── SonarREADME.md
```

主なファイル:

- `docker-compose.yml`: SonarQube 一式の起動定義
- `SonarQubeScriptContainer/Dockerfile`: report API 用コンテナ定義
- `SonarQubeScriptContainer/report_api.py`: FastAPI によるレポート API
- `SonarQubeScriptContainer/SonarHtmlExport.py`: HTML レポート生成スクリプト

補足:

- `sonar-report-api` は HTML を `/reports` に保存する構成です
- compose では `./SonarQubeScriptContainer/generated-reports:/reports` を mount しています
- 初回起動時に `generated-reports/` が自動生成される場合があります

## 4. 前提条件

| 種別 | 必須 | 備考 |
|---|---|---|
| Docker Engine | 必須 | 起動済みであること |
| Docker Compose V2 | 必須 | `docker compose` が利用可能であること |
| 空きポート `9000` | 必須 | SonarQube UI 用 |
| 空きポート `8080` | 任意 | report API 既定ポート。変更可 |
| SonarQube token | 一部必須 | report API / スクリプト利用時に必要 |

補足:

- SonarQube UI を見るだけであれば `SONAR_TOKEN` は不要です
- `sonar-report-api` を起動する場合は `SONAR_TOKEN` の設定が必要です
- HTML レポート生成には、対象プロジェクトが SonarQube 上で解析済みである必要があります

## 5. 構成ファイルの注意点

現在の配置は `common-archetecture/TOOL/SonarQube/` 直下に集約されていますが、`docker-compose.yml` および `SonarQubeScriptContainer/Dockerfile` 内には `SonarQubeDev/...` を参照する記述が残っています。

対象箇所:

- `docker-compose.yml` の `build.dockerfile`
- `SonarQubeScriptContainer/Dockerfile` の `COPY` パス

このままでは、配置変更後の実ディレクトリ構成と不一致になる可能性があります。

本書は現行ファイル構成を説明する正本ですが、実行前には compose / Dockerfile の参照パス整合性を確認してください。

## 6. 環境変数

`sonar-report-api` で利用する主な環境変数は以下の通りです。

| 変数名 | 必須 | 既定値 | 用途 |
|---|---|---|---|
| `SONAR_TOKEN` | 必須 | なし | SonarQube API へ接続するための token |
| `SONAR_HOST_URL` | 任意 | `http://sonarqube:9000` | report API から見た SonarQube URL |
| `REPORT_API_KEY` | 任意 | 空 | API 保護用の共有キー |
| `REPORT_API_PORT` | 任意 | `8080` | host 側公開ポート |
| `REPORT_TIMEOUT` | 任意 | `20` | レポート生成時の API timeout |
| `REPORT_MAX_ISSUES` | 任意 | `0` | 既定の issue 最大件数。`0` は全件 |
| `SONAR_EXPORT_SCRIPT_PATH` | compose 内固定 | `/app/SonarHtmlExport.py` | 実行スクリプトのパス |
| `REPORT_OUTPUT_DIR` | compose 内固定 | `/reports` | HTML 保存先 |

運用ルール:

- `SONAR_TOKEN` はコンテナ内でのみ参照し、クライアント側へ公開しない
- localhost 以外へ公開する場合は `REPORT_API_KEY` を設定する
- 外部共有する場合でも、最低限 internal-only / VPN / reverse proxy 配下で運用する

## 7. 起動手順

### 7.1 実行ディレクトリへ移動

```bash
cd common-archetecture/TOOL/SonarQube
```

### 7.2 必要な環境変数を設定

report API を含めて起動する場合:

```bash
export SONAR_TOKEN=<YOUR_SONAR_TOKEN>
export REPORT_API_KEY=<OPTIONAL_SHARED_KEY>
export REPORT_API_PORT=8080
```

補足:

- `REPORT_API_KEY` は任意です
- `SONAR_HOST_URL` を省略した場合、compose 内サービス名 `sonarqube` 宛ての `http://sonarqube:9000` が使われます

### 7.3 起動

```bash
docker compose up -d
```

ログを見ながら起動したい場合:

```bash
docker compose up
```

### 7.4 起動確認

```bash
docker compose ps
```

期待値:

- `sonarqube-dev` が起動している
- `sonarqube-dev-db` が起動している
- `sonar-report-api` が起動している

補足:

- SonarQube は初回起動に時間がかかることがあります
- `db` が先に起動し、その後に `sonarqube` が安定する流れです

## 8. 利用方法

### 8.1 SonarQube UI の利用

アクセス先:

- SonarQube UI: `http://localhost:9000`

確認ポイント:

- SonarQube ログイン画面が表示されること
- 対象 project key が登録済みであること
- 対象プロジェクトに解析結果が存在すること

補足:

- report API / スクリプトは、解析結果がない project に対しては有効なレポートを生成できません

### 8.2 report API の利用

エンドポイント:

- `GET /health`
- `POST /generate`

health check:

```bash
curl http://localhost:8080/health
```

期待される応答:

```json
{"status":"ok"}
```

HTML を直接返す例:

```bash
curl -X POST http://localhost:8080/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <OPTIONAL_SHARED_KEY>" \
  -d '{
    "project": "kyotsukiban-frontend",
    "branch": "main",
    "jp": true,
    "max_issues": 200
  }'
```

JSON で保存先を受け取る例:

```bash
curl -X POST http://localhost:8080/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <OPTIONAL_SHARED_KEY>" \
  -d '{
    "project": "kyotsukiban-frontend",
    "branch": "main",
    "download": true
  }'
```

補足:

- `REPORT_API_KEY` 未設定時は `X-API-Key` ヘッダなしでも利用可能です
- `download: true` の場合、HTML 本文ではなく保存先を含む JSON を返します

### 8.3 `SonarHtmlExport.py` の直接利用

`sonar-report-api` を使わず、スクリプトを直接実行することもできます。

前提:

- Python 3.x
- `requests` インストール済み
- 対象 SonarQube へ到達可能
- 有効な token と project key を持っている

必須引数:

- `--project`
- `--token`

主な任意引数:

- `--host`
- `--branch`
- `--output`
- `--timeout`
- `--max-issues`
- `--insecure`

実行例:

```bash
python SonarQubeScriptContainer/SonarHtmlExport.py \
  --host http://localhost:9000 \
  --project BizFlow-BE \
  --token <YOUR_TOKEN> \
  --output sonar-report-BE.html
```

self-signed 証明書環境で TLS 検証を無効化する場合:

```bash
python SonarQubeScriptContainer/SonarHtmlExport.py \
  --host https://localhost:9000 \
  --project BizFlow-BE \
  --token <YOUR_TOKEN> \
  --output sonar-report-BE.html \
  --insecure
```

## 9. リクエストパラメータ

`POST /generate` の request body では、以下の項目を利用できます。

| 項目 | 必須 | 内容 |
|---|---|---|
| `project` | 必須 | SonarQube project key |
| `branch` | 任意 | 対象 branch 名 |
| `jp` | 任意 | `true` で日本語ラベル表示 |
| `max_issues` | 任意 | 表示する issue 件数上限 |
| `insecure` | 任意 | TLS 検証を無効化 |
| `download` | 任意 | `true` で保存先 JSON を返す |

補足:

- `project` が未指定の場合はエラーになります
- `branch` 未指定時は API 側では `main` 相当の表示名で扱われます
- `max_issues=0` は全件表示です

## 10. 出力物

report API により生成された HTML は、compose の volume mount を通して以下へ保存されます。

```text
common-archetecture/TOOL/SonarQube/SonarQubeScriptContainer/generated-reports/
```

ファイル名ルール:

```text
<project>-<branch>-<timestamp>.html
```

例:

```text
kyotsukiban-frontend-main-20260416T103000Z.html
```

保存タイミング:

- `POST /generate` 実行成功時
- HTML 返却モード / `download: true` モードのいずれでも保存される

## 11. 停止・再起動・初期化

停止:

```bash
docker compose down
```

再起動:

```bash
docker compose restart
```

volume を含めて初期化:

```bash
docker compose down -v
```

注意:

- `down -v` を実行すると SonarQube / PostgreSQL の永続データが削除されます
- 再作成後は SonarQube の状態が初期化されるため、必要に応じて再設定や再解析が必要です

## 12. 運用上の注意

- 本構成は独立ツールであり、基盤モジュール本体の標準開発手順とは分離して扱う
- `SONAR_TOKEN` は server-side のみで保持し、クライアント配布しない
- 外部公開時は `REPORT_API_KEY` の設定だけでなく、公開経路自体も制限する
- HTML レポートは SonarQube の解析済みデータに依存するため、未解析プロジェクトには使えない
- report API は `SonarHtmlExport.py` のラッパーであり、根本的なデータ取得元は SonarQube API です

## 13. トラブルシュート

### 13.1 `SONAR_TOKEN must be set` で起動できない

原因:

- `sonar-report-api` 起動に必要な `SONAR_TOKEN` が未設定

対応:

```bash
export SONAR_TOKEN=<YOUR_SONAR_TOKEN>
docker compose up -d
```

### 13.2 `port is already allocated` が出る

原因:

- `9000` または `8080` を別プロセスが使用している

対応:

- 競合プロセスを停止する
- または `REPORT_API_PORT` を変更する

例:

```bash
export REPORT_API_PORT=18080
docker compose up -d
```

### 13.3 SonarQube UI に接続できない

原因候補:

- SonarQube の起動完了前
- `db` の起動が安定していない
- container 自体が restart を繰り返している

確認:

```bash
docker compose ps
docker compose logs sonarqube
docker compose logs db
```

### 13.4 レポート生成が失敗する

原因候補:

- token が無効
- project key が存在しない
- SonarQube サーバーへ到達できない
- 対象 project に解析結果がない

確認ポイント:

- `SONAR_TOKEN` の値
- `project` の指定名
- `SONAR_HOST_URL`
- SonarQube UI 上で対象 project が参照可能か

### 13.5 配置変更後に build / copy パスが合わない

原因:

- compose や Dockerfile に旧ディレクトリ名 `SonarQubeDev/...` が残っている

確認対象:

- `docker-compose.yml`
- `SonarQubeScriptContainer/Dockerfile`

対応:

- 現在の `common-archetecture/TOOL/SonarQube/` 配下構成に合わせて参照パスを見直す

### 13.6 `SonarHtmlExport.py` 単体実行時に失敗する

原因候補:

- `requests` が未インストール
- `--project` または `--token` が未指定
- `--output` の保存先に書き込み権限がない
- SonarQube 側へ到達できない

確認ポイント:

- `python` コマンドで Python 3.x が利用できること
- `pip install requests` 済みであること
- 指定した project key に解析結果があること
- 指定した output path が書き込み可能であること

## 14. 参照ファイル

- compose 定義: [docker-compose.yml](./docker-compose.yml)
- report API: [SonarQubeScriptContainer/report_api.py](./SonarQubeScriptContainer/report_api.py)
- HTML export script: [SonarQubeScriptContainer/SonarHtmlExport.py](./SonarQubeScriptContainer/SonarHtmlExport.py)
- report API image 定義: [SonarQubeScriptContainer/Dockerfile](./SonarQubeScriptContainer/Dockerfile)
