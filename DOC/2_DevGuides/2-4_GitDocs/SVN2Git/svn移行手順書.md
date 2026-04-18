## ✅ 【作業手順書】SVNからGitへのTrunk部分の移行手順（snp2プロジェクト）

### 🔧 事前準備

1. **必要なツールをインストール**

   * `git`
   * `git-svn`
   * `curl`（接続確認用）
   * `nano` や `vim`（設定ファイル編集用）

2. **WSL経由で作業する**

   * PowerShellでは一部のファイル操作や権限でエラーが出るため、WSLを使用。

3. **認証情報の自動入力対応**

   * `~/.netrc` ファイルを作成し、以下のように記述して保存（`Ctrl+O` → `Enter` → `Ctrl+X` で保存）：

     ```
     machine sys.dev.genesys-eco.jp
     login ryo-ooji
     password ********
     ```

---

### 🗂 作業ディレクトリ構成

* `/mnt/c/Project/svn/`：元のWindows上の作業ディレクトリ
* `~/svn-clone/`：WSL側のクローン先ディレクトリ

---

### 📥 git svn clone 実行（trunkのみ）

```bash
cd ~/svn-clone

git svn clone \
  --trunk=kun/trunk \
  --authors-file=/mnt/c/Project/svn/authors.txt \
  http://sys.dev.genesys-eco.jp/svn/snp2 \
  snp2-kun-trunk-only
```

> ※authors.txt は SVN ユーザー名と Git ユーザー名の対応表
> ※toolsにユーザー情報一括取得スクリプト.mdを同梱しているので使い方を参照して下さい。
> ※なお、対象の数が多く、タイムアウトなどが発生する場合は別途分割取得を行って下さい。tools/分割取得スクリプト.mdを参照。

---

### 🔀 ブランチ名の整理と初期設定

```bash
cd snp2-kun-trunk-only
git checkout -b trunk origin/trunk
git remote add origin https://ide-gitlab.j-ems.jp/wmf-group/kuntest.git
```

---

### 🚀 GitLab へのプッシュ

```bash
git push -u origin trunk
```

> ※ `fetch_svn_branches.sh` のような作業用スクリプトがある場合は `.gitignore` に追加し、commit しないように注意。

---

## 📄 【テンプレート】SVN → Git (trunk) 移行手順（一般化）

---

### 1. 事前準備

* git, git-svn, curl, nano など必要ツールをインストール
* 認証設定を `.netrc` で記述しておく

```
machine <SVNホスト名>
login <ユーザー名>
password <パスワード>
```

---

### 2. クローン先ディレクトリ作成

```bash
mkdir -p ~/svn-clone
cd ~/svn-clone
```

---

### 3. git svn clone（trunkのみ）

```bash
git svn clone \
  --trunk=<SVN内のtrunkパス> \
  --authors-file=<authors.txtのフルパス> \
  <SVNリポジトリURL> \
  <クローン先ディレクトリ名>
```

---

### 4. Gitブランチ名設定とリモート登録

```bash
cd <クローン先ディレクトリ名>
git checkout -b trunk origin/trunk
git remote add origin <GitLabリポジトリURL>
```

---

### 5. プッシュ

```bash
git push -u origin trunk
```


