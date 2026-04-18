# Java Legacy Family（Apache + Tomcat）

`java-legacy` family は、Apache と Tomcat を分離した旧来構成の開発・検証テンプレートです。
Java 実行基盤は `Java 1.8.0_202`、Tomcat は `Apache Tomcat 6.0.43` を標準とします。

## 起動

```bash
docker/stack.sh --family java-legacy up
docker/stack.sh --family java-legacy status
```

## OTel（metrics）

```bash
docker/stack.sh --family java-legacy otel
docker/stack.sh --family java-legacy otel-metrics
```

最小観測として、以下を collector で集約します。

- Apache `mod_status`（アクセス/ワーカー系）
- HTTP ヘルスチェック（Apache/Tomcat の疎通・応答時間）

## 停止

```bash
docker/stack.sh --family java-legacy down
```

## 既定ポート

- Apache: `http://localhost:8088`（`JAVA_LEGACY_APACHE_PORT` で変更可）
- Tomcat: `http://localhost:18080`（`JAVA_LEGACY_TOMCAT_PORT` で変更可）

## 配備

- Tomcat 配備先（WAR / exploded app）: `dist/java-legacy/tomcat/webapps/`
- Apache 静的コンテンツ: `dist/java-legacy/apache/htdocs/`

## 事前準備（必須）

- `docker/java-legacy/assets/` に JDK tarball を配置
- 推奨ファイル名: `jdk-8u202-linux-x64.tar.gz`
- 任意で `6.zip`（Tomcat 一式パッケージ）を同ディレクトリに配置可能
- 参照: `docker/java-legacy/assets/README.md`
- Tomcat は `https://archive.apache.org/dist/tomcat/tomcat-6/v6.0.43/bin/` から build 時に取得

## メモ

- Apache は `docker/java-legacy/apache/jems-legacy-proxy.conf` で Tomcat へリバースプロキシします。
- family は当面排他的運用です。`modern` と `java-legacy` を同時起動しないでください。
- 旧来の Struts / Spring MVC（Boot なし）など、WAR 配備型アプリを主対象とします。
- `6.zip` を配置した場合、`webapps` が空のときに起動時シードします。
