# IT-TEST-TOOLS（総合テスト用ツール）移植ガイド

本ドキュメントは、総合テスト用ツールを他PJへ展開する際の現行構成をまとめたものです。  
旧 OTel 資産は廃止済みで、このガイドには含めません。

---

## 1. 現行ツール構成

- k6: 負荷テスト（CI）
- Lighthouse CI: UI/パフォーマンス計測（CI）
- OpenTelemetry Collector + InfluxDB: 開発環境の観測基盤（Docker）
- Docker Compose + `docker/stack.sh`: 起動導線

---

## 2. 移植対象（現行）

### 2.1 CI（k6）

- `CI/qa/k6/.gitlab-ci-k6.yml`
- `CI/qa/k6/k6-ci-setup.md`
- `CI/qa/k6/k6.md`
- `CI/login_test.js`
- `CI/script.js`
- `CI/qa/k6/k6-tests/`

### 2.2 CI（Lighthouse CI）

- `CI/qa/lhci/.gitlab-ci-lhci.yml`
- `CI/qa/lhci/lighthouse-ci-guide.md`
- `CI/qa/lhci/.lighthouserc.json`

### 2.3 Docker（OTel / Monitoring）

- `docker/compose.base.yml`
- `docker/compose.family.modern.yml`
- `docker/compose.yml`
- `docker/otel/otel-collector.yaml`
- `docker/stack.sh`
- `docker/README.md`

---

## 3. 移植先PJでのセットアップ

### 3.1 k6

1. `CI/qa/k6/.gitlab-ci-k6.yml` と k6 スクリプト群を移植
2. ルート `.gitlab-ci.yml` に include を追加
3. `K6_SCRIPT_PATH` を設定

### 3.2 Lighthouse CI

1. `CI/qa/lhci/.gitlab-ci-lhci.yml` と `.lighthouserc.json` を移植
2. ルート `.gitlab-ci.yml` に include を追加
3. `LHCI_URL` を設定

### 3.3 OTel / Monitoring（Docker）

1. `docker/` 配下の OTel 関連ファイルを移植
2. `bash docker/stack.sh --family modern otel` で Collector + InfluxDB を起動
3. `bash docker/stack.sh --family modern otel-metrics` で metrics 取得を確認

---

## 4. 注意点

- OTel の CI 専用雛形（旧方式）は現行リポジトリには存在しません。
- OTel の正規設定は `docker/otel/otel-collector.yaml` です。
- 起動入口は `docker/stack.sh` を標準とし、個別 `docker run` は増やさない運用を推奨します。

---

## 5. 最低チェックリスト

1. k6 / LHCI の include が `.gitlab-ci.yml` に追加されている
2. `bash docker/stack.sh --family modern otel` で `influxdb` と `otel-collector` が healthy
3. `bash docker/stack.sh --family modern otel-metrics` で `dist/otel/collector-metrics.prom` が出力される
4. InfluxDB に measurement が保存される（`SHOW MEASUREMENTS`）
