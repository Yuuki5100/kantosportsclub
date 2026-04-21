# チートシート（分割起動: instance1 / instance2 / instance3）

## 1) ログ付きの起動方法

```bash
bash docker/stack.sh instance1-backend docker/env/instance1.env --logs
```
instance1 の backend のみを起動し、同一ターミナルでログ追従します。

```bash
bash docker/stack.sh instance1 docker/env/instance1.env --logs
```
instance1（backend + gateway）を起動し、同一ターミナルでログ追従します。

```bash
bash docker/stack.sh instance1-sync docker/env/instance1.env --logs
```
instance1（backend + gateway + syncconnector）を起動し、同一ターミナルでログ追従します。

```bash
bash docker/stack.sh instance2 docker/env/instance2.env --logs
```
instance2（batchserver）を起動し、同一ターミナルでログ追従します。

```bash
bash docker/stack.sh instance3 docker/env/instance3.env --logs
```
instance3（frontend-static）を起動し、同一ターミナルでログ追従します。
内部的には `frontend-static` を再ビルドしてから起動するので、`NEXT_PUBLIC_API_BASE_URL` などの build 引数変更もこのコマンドで反映されます。

```bash
bash docker/stack.sh instance1-sync docker/env/instance1.env --logs=tmux
```
instance1 の各サービスログを tmux ウィンドウ分割で追従します。

## 2) 各サービスのログ取得方法

```bash
bash docker/stack.sh logs-backend-f docker/env/instance1.env
```
instance1 の backend ログを `journalctl -f` のようにリアルタイム追従します。

```bash
bash docker/stack.sh logs-backend docker/env/instance1.env
```
instance1 の backend ログを `stack.sh` 経由で表示します。

```bash
docker compose --env-file docker/env/instance1.env -f docker/compose.yml logs -f backend
```
instance1 の backend ログを追従表示します。

```bash
docker compose --env-file docker/env/instance1.env -f docker/compose.yml logs -f gateway
```
instance1 の gateway ログを追従表示します。

```bash
docker compose --env-file docker/env/instance1.env -f docker/compose.yml --profile syncconnector logs -f syncconnector
```
instance1 の syncconnector ログを追従表示します。

```bash
docker compose --env-file docker/env/instance2.env -f docker/compose.yml logs -f batchserver
```
instance2 の batchserver ログを追従表示します。

```bash
docker compose --env-file docker/env/instance3.env -f docker/compose.yml logs -f frontend-static
```
instance3 の frontend-static ログを追従表示します。

```bash
docker compose --env-file docker/env/instance3.env -f docker/compose.yml logs -f frontend
```
instance3-dev を使う場合の frontend ログを追従表示します。

## 3) 全サービスのログを一つのターミナルにまとめて出力

```bash
docker compose --env-file docker/env/instance1.env -f docker/compose.yml --profile syncconnector logs -f
```
instance1 ホスト上の全起動コンテナログを 1 つのターミナルで追従表示します。

```bash
docker compose --env-file docker/env/instance2.env -f docker/compose.yml logs -f
```
instance2 ホスト上の全起動コンテナログを 1 つのターミナルで追従表示します。

```bash
docker compose --env-file docker/env/instance3.env -f docker/compose.yml logs -f
```
instance3 ホスト上の全起動コンテナログを 1 つのターミナルで追従表示します。
