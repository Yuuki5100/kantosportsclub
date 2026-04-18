# チートシート（テストフェーズ）

## 1) 初期化と前提確認

```bash
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"
cd "$PROJECT_ROOT"
echo "PROJECT_NAME=$PROJECT_NAME"
```
リポジトリルートへ移動します。

```bash
bash docker/stack.sh all-in-one --logs
```
テスト対象のローカル環境（MySQL/Redis/MinIO/backend/gateway/batchserver/frontend）を起動します。

```bash
bash docker/stack.sh seed-data
```
MySQL/MinIO の共通 QA seed を再投入します。

```bash
bash docker/stack.sh status
```
主要コンテナの起動状態を確認します。

## 2) ローカルテスト実行コマンド

```bash
bash docker/stack.sh test-fe
```
frontend の `lint + jest --coverage` を実行します。

```bash
bash docker/stack.sh test-be
```
backend の Maven テストを実行します。

```bash
bash docker/stack.sh e2e
```
Playwright smoke E2E を実行します。

```bash
bash docker/stack.sh k6
```
k6 smoke 負荷テストを実行し、`dist/k6/summary.json` を出力します。

```bash
bash docker/stack.sh zap-baseline
```
OWASP ZAP baseline scan を実行し、`dist/zap/` にレポートを出力します。

## 3) よく使う上書き変数

```bash
K6_TARGET_URL=http://gateway:8888/ K6_VUS=20 K6_DURATION=1m bash docker/stack.sh k6
```
k6 の対象 URL / VU / 実行時間を上書きします。

```bash
ZAP_TARGET_URL=http://frontend-zap:3000 ZAP_SPIDER_MINUTES=5 bash docker/stack.sh zap-baseline
```
ZAP の対象 URL / spider 時間を上書きします。

## 4) 生成物の確認先

```bash
ls -la FE/spa-next/my-next-app/coverage
```
frontend coverage の出力を確認します。

```bash
ls -la FE/spa-next/my-next-app/scripts/jest-report.html
```
frontend Jest HTML レポートを確認します。

```bash
ls -la dist/k6/summary.json
```
k6 サマリ JSON を確認します。

```bash
ls -la dist/zap
```
ZAP レポート（`report.json` / `report.html` / `report.md`）を確認します。

## 5) CI 手動実行の変数早見表

`Run pipeline` で必要な変数を `true` にして実行します。

- E2E: `E2E_SMOKE=true`, `E2E_BASE_URL=https://<target-host>`
- k6: `K6_SMOKE=true`, `K6_TARGET_URL=https://<target-host>/`, `K6_VUS`, `K6_DURATION`
- ZAP: `ZAP_BASELINE=true`, `ZAP_TARGET_URL=https://<target-host>`, `ZAP_SPIDER_MINUTES`, `ZAP_BASELINE_CONFIG`
- ST 証跡アーカイブ: `ST_EVIDENCE_ARCHIVE=true`

## 6) 終了とクリーンアップ

```bash
bash docker/stack.sh down
```
通常の停止です。

```bash
docker compose --profile security --profile performance --profile syncconnector --profile test -f docker/compose.yml down
```
テスト系 profile コンテナ（k6/ZAP など）も含めて停止します。

```bash
bash docker/stack.sh down-v
```
volume も削除して初期化します（DB データを消します）。
