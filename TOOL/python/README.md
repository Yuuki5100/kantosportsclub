# Python Tools Workspace

このディレクトリは `docker/python-tools`（Compose service: `python-tools`）向けの
依存管理・実行用ワークスペースです。

## 主要コマンド

```bash
# Python バージョン確認
docker/stack.sh python

# lock 更新
docker/stack.sh python-lock

# 依存同期（uv.lock があれば --frozen）
docker/stack.sh python-sync
```

## 依存追加例

```bash
docker compose -f docker/compose.yml --profile tools run --rm python-tools uv add requests
docker/stack.sh python-lock
docker/stack.sh python-sync
```
