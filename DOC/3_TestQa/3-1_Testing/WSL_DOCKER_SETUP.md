# WindowsでDockerを使うための環境構築（Docker Desktop不使用）

本書は **Windows + WSL2 + Docker Engine** を使って、Docker DesktopなしでDockerを動かす手順です。

対象:
- Windows 10/11
- Docker Desktopは使用不可
- WSL2上でDocker Engineを稼働

---

## 1. 前提条件

- Windowsが仮想化対応（BIOS/UEFIでVT-x/AMD-Vが有効）
- 管理者権限があること

---

## 2. WSL2の有効化

管理者PowerShellで実行:

```powershell
wsl --install
```

既にWSLが入っている場合は以下を実行:

```powershell
wsl --set-default-version 2
```

インストール後、再起動。

---

## 3. Linuxディストリビューションを準備

例: Ubuntuを入れる

```powershell
wsl --install -d Ubuntu
```

初回起動時にユーザー名/パスワードを設定。

---

## 4. WSL上にDocker Engineをインストール

WSL（Ubuntu）で実行:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 5. Dockerデーモン起動

WSL上で:

```bash
sudo service docker start
```

自動起動を有効にする場合（推奨）:

```bash
sudo systemctl enable docker
```

※ WSLではsystemdが無効な場合があります。必要なら `wsl.conf` で有効化してください。

---

## 6. systemd有効化（必要な場合）

`/etc/wsl.conf` を作成/編集:

```bash
sudo tee /etc/wsl.conf > /dev/null <<'EOF'
[boot]
systemd=true
EOF
```

Windows側でWSLを再起動:

```powershell
wsl --shutdown
```

再度Ubuntuを起動して:

```bash
sudo systemctl status docker
```

---

## 7. Docker動作確認

WSL上で:

```bash
docker version
docker run --rm hello-world
```

---

## 8. WindowsからWSLのDockerを使う（任意）

Windows側に `docker` クライアントを入れたい場合:
- `\wsl$\Ubuntu\usr\bin\docker` をパスに追加する運用も可能
- もしくは Windows では `wsl docker <command>` と実行

例:

```powershell
wsl docker ps
```

---

## 9. トラブルシューティング

### Dockerデーモンが起動しない
- `sudo service docker status` で状態確認
- `systemd=true` の設定を確認

### `permission denied` が出る
- `sudo usermod -aG docker $USER` を実行
- その後一度ログアウト/ログイン

### WSLからネットワーク接続できない
- WindowsのVPN/Proxy設定を確認

---

## 10. 最短起動・確認フロー（まとめ）

```bash
# WSL上
a) sudo service docker start
b) docker version
c) docker run --rm hello-world
```

以上。
