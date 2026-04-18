# 環境構築（Ubuntu 最小セット）

## 最低限必要なもの

- Docker（`docker compose` が使えること）
- VS Code（WSL 拡張で Ubuntu 側を開く）
- Git

## Ubuntu 側の最小コマンド

```bash
sudo apt update
sudo apt install -y git curl ca-certificates
```

## Docker / Compose 動作確認

```bash
docker --version
docker compose version
docker info
```

## VS Code（WSL）動作確認

```bash
code --version
```

`code` コマンドが未導入の場合は、VS Code の WSL 拡張から Ubuntu セッションで再設定してください。

## Git 初期設定（未設定の場合）

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Family 運用ルール参照

- 実行時の family 運用ルール（正本）: [03_run_guide.md](./03_run_guide.md)
- 現行の環境方針まとめ: [開発環境.md](./開発環境.md)
- 拡張計画と採用判断: [ドッカー拡張計画.md](./ドッカー拡張計画.md)
