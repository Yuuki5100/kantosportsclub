# チートシート（all-in-one 起動）

## 1) ログ付きの起動方法

```bash
bash docker/stack.sh all-in-one --logs
```
all-in-one 構成を起動し、主要サービスログを同一ターミナルで追従します。

```bash
bash docker/stack.sh all-in-one-sync --logs
```
syncconnector を含む all-in-one 構成を起動し、同一ターミナルでログ追従します。

```bash
bash docker/stack.sh all-in-one-sync --logs=tmux
```
syncconnector を含む all-in-one 構成を起動し、サービスごとに tmux ウィンドウでログ追従します。

## 2) 各サービスのログ取得方法

```bash
docker compose -f docker/compose.yml logs -f backend
```
appserver（backend）のログを追従表示します。

```bash
docker compose -f docker/compose.yml logs -f gateway
```
gateway のログを追従表示します。

```bash
docker compose -f docker/compose.yml --profile syncconnector logs -f syncconnector
```
syncconnector のログを追従表示します。

```bash
docker compose -f docker/compose.yml logs -f batchserver
```
batchserver のログを追従表示します。

```bash
docker compose -f docker/compose.yml logs -f frontend
```
frontend（Next.js dev）のログを追従表示します。

```bash
docker compose -f docker/compose.yml logs -f mysql
```
MySQL のログを追従表示します。

```bash
docker compose -f docker/compose.yml logs -f redis
```
Redis のログを追従表示します。

```bash
docker compose -f docker/compose.yml logs -f minio
```
MinIO のログを追従表示します。

```bash
docker compose -f docker/compose.yml logs -f minio-init
```
MinIO 初期化コンテナのログを表示します（通常は完了済みログ）。

## 3) 全サービスのログを一つのターミナルにまとめて出力

```bash
docker compose -f docker/compose.yml logs -f
```
all-in-one の全サービスログを 1 つのターミナルで追従表示します。

```bash
docker compose -f docker/compose.yml --profile syncconnector logs -f
```
syncconnector を含む全サービスログを 1 つのターミナルで追従表示します。
