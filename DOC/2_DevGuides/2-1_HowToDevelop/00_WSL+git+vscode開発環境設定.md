# WSL + Git + VS Code 開発環境設定

Windows 上で WSL 2 と Ubuntu 24.04 LTS を用意し、VS Code から WSL に接続して開発するための手順をまとめます。

## 1. WSL / Ubuntu の導入

### 1.1. まだ WSL を導入していない方向け（WSL + Ubuntu を一括インストール）
本ドキュメントでは、安定版として `WSL 2` と `Ubuntu 24.04 LTS` を使用します。

管理者権限で PowerShell を起動し、以下を実行します。

```powershell
wsl --install -d Ubuntu-24.04
```

必要に応じて Windows を再起動してください。

インストール後はスタートメニューから `Ubuntu 24.04 LTS` を起動し、初回セットアップを行います。

1. Ubuntu を起動する
2. Linux の username を入力する
3. Linux の password を入力する
4. 確認のため、同じ password を再入力する

注意:
- password 入力中は文字が表示されませんが正常です。
- この username/password は WSL 上の Ubuntu 用であり、Windows アカウントとは別です。
- `wsl -l -v` 実行時に、対象ディストリビューションが `VERSION 2` になっていることを確認してください。

動作確認:

```powershell
wsl -l -v
```

WSL のみ導入済みの方は `1.2` へ進んでください。
完了したら `2. Ubuntu 起動後の初期セットアップ` へ進んでください。

### 1.2. WSL 導入済みの方向け（Ubuntu バージョンを 24.04 LTS に統一）
既に WSL を利用している場合は、以下の手順で Ubuntu バージョンを統一します。

まず、利用可能なディストリビューションを確認します。

```powershell
wsl --list --online
wsl -l -v
```

`Ubuntu-24.04` が未導入の場合はインストールします。

```powershell
wsl --install -d Ubuntu-24.04
```

以後の標準ディストリビューションを `Ubuntu-24.04` に設定します。

```powershell
wsl --set-default Ubuntu-24.04
```

再確認:

```powershell
wsl -l -v
```

補足:
- 旧 Ubuntu（例: `Ubuntu`, `Ubuntu-22.04`）は、作業データ移行後に必要に応じて整理してください。
- 未移行データがある状態で `wsl --unregister <DistroName>` を実行するとデータは削除されます。

完了したら `2. Ubuntu 起動後の初期セットアップ` へ進んでください。

## 2. Ubuntu 起動後の初期セットアップ

Ubuntu 起動後の初期セットアップ:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git
git --version
```

Git の名前とメールアドレスを設定する場合は、WSL 側で以下を実行します。

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global --list
```

Windows 側ですでに Git の identity を設定済みであれば、同じ値を WSL 側にも設定してください。

作業する場所はとても重要です。
ソースコードや clone したリポジトリは、**Windows 側の `C:` ドライブではなく、WSL の Ubuntu 側に保存してください。**

やってはいけない例:
- `C:\Users\your-name\projects`
- `/mnt/c/Users/your-name/projects`
- `/mnt/c/...` 配下の任意のフォルダ

推奨する保存先:
- `/home/<your-user>/projects`
- `~/projects`

なぜか:
- WSL 上の開発ツールは、Ubuntu 側のファイルを使う前提で動かすと安定しやすいためです。
- `C:` や `/mnt/c/...` 配下で作業すると、権限やファイル監視、ビルド、実行速度などで問題が出ることがあります。
- VS Code の WSL 接続、Docker、Node.js などの開発ツールも、WSL 側のディレクトリで作業した方がトラブルを避けやすくなります。

迷ったときの判断方法:
- パスの先頭が `/home/` なら WSL 側なので OK です。
- パスの先頭が `/mnt/c/` なら Windows 側なので NG です。

最初に Ubuntu 上で作業フォルダを作成してください。

```bash
mkdir -p ~/projects
cd ~/projects
```

現在いる場所を確認したい場合は、以下を実行してください。

```bash
pwd
```

表示結果の例:
- OK: `/home/oji/projects`
- NG: `/mnt/c/Users/oji/projects`

## 3. Docker のインストール

WSL 上の Ubuntu に Docker Engine を導入する場合は、以下を実行します。

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

```bash
# Docker APT リポジトリを登録（echo よりコピー事故が少ない書き方）
source /etc/os-release
printf "deb [arch=%s signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu %s stable\n" \
  "$(dpkg --print-architecture)" "${UBUNTU_CODENAME:-$VERSION_CODENAME}" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

続けて、`sudo` なしで `docker` コマンドを使えるように設定します。

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

`groupadd` で `group 'docker' already exists` のように表示された場合は、そのまま次のコマンドへ進んで問題ありません。

インストール後の確認:

```bash
docker --version
docker compose version
docker run --rm hello-world
```

うまく反映されない場合は、Ubuntu をいったん閉じて再度開くか、WSL セッションに入り直してから再実行してください。

## 4. VS Code のインストール
VS Code は Windows 側にインストールします。

1. Windows 版 VS Code をインストールする
2. インストール完了後に VS Code を起動する
3. 必要に応じて PowerShell で `code --version` を実行し、コマンドが利用できることを確認する

## 5. VS Code の WSL 拡張をインストールして動作確認
Windows 側の VS Code で、Microsoft の `WSL` 拡張をインストールします。

| 項目 | 内容 | 確認方法 |
| --- | --- | --- |
| 拡張機能名 | WSL | Extensions 画面で `WSL` と表示されること |
| 拡張 ID | `ms-vscode-remote.remote-wsl` | 詳細画面で ID を確認できること |
| 用途 | VS Code から WSL 上の Ubuntu に接続する | 左下のステータスバーに `WSL: Ubuntu` などと表示されること |
| 接続方法 | コマンドパレットで `WSL: Connect to WSL` を実行する | 新しい VS Code ウィンドウが WSL モードで開くこと |
| ターミナル確認 | WSL 接続後に Terminal を開く | `whoami` や `pwd` が Ubuntu 側の値を返すこと |
| フォルダ確認 | WSL 上の作業フォルダを開く | `/home/<user>/projects/...` 配下を開けること |

WSL 接続後は、VS Code のターミナルからリポジトリを clone してください。

```bash
mkdir -p ~/projects
cd ~/projects
git clone https://your-repo-url
cd your-repo
```

リポジトリは Windows の `C:` ドライブではなく、WSL の Linux filesystem 配下に配置してください。

## 6. Family 運用ルール参照

- 実行時の family 運用ルール（正本）: [03_run_guide.md](./03_run_guide.md)
- 現行の環境方針まとめ: [開発環境.md](./開発環境.md)
- 拡張計画と採用判断: [ドッカー拡張計画.md](./ドッカー拡張計画.md)
