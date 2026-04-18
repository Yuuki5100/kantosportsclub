# Java Legacy Assets

`java-legacy` family の Tomcat コンテナは、`Java 1.8.0_202` の tarball をローカル資産から読み込んでビルドします。
任意で `6.zip`（Tomcat 一式パッケージ）を配置すると、その内容を legacy 設定として反映します。

## 配置ルール

- 配置先: `docker/java-legacy/assets/`
- 期待形式: `*.tar.gz`
- 推奨ファイル名: `jdk-8u202-linux-x64.tar.gz`
- 任意ファイル: `6.zip`

## 取得元

- JDK: Oracle アカウントで取得した `1.8.0_202` tarball を利用
  - 社内参照: `運用基盤課_サービスアカウント一覧表.xlsx`
- Tomcat: `https://archive.apache.org/dist/tomcat/tomcat-6/v6.0.43/bin/` から build 時に取得

## 注意

- 本ディレクトリの JDK tarball は秘匿情報/ライセンス管理対象になり得るため、Git 管理には含めません。
- build 時に `java -version` を確認し、`1.8.0_202` 以外は失敗します。
- `6.zip` を配置した場合、`bin/lib/conf` を上書きし、`webapps` は起動時に空ディレクトリへシードされます。
