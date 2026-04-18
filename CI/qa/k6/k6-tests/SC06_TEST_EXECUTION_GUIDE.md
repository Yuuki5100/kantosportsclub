# SC06 テスト実行ガイド（テンプレート）

## 概要

SC06テストは、セキュリティ関連のテストシナリオを検証するためのk6負荷テストスイートです。

---

## 環境情報

### 本番環境A（例）

| 項目 | 値 |
|------|-----|
| URL | https://<PRD_HOST_A> |
| DB Host | <DB_HOST_A> |
| DB Name | <DB_NAME_A> |
| DB User | <DB_USER_A> |
| ログ保存場所 | <LOG_PATHS_A> |
| SSH踏み台 | <BASTION_IP_A> |
| アプリサーバー | <APP_SERVER_IP_A> |

### 本番環境B（例）

| 項目 | 値 |
|------|-----|
| URL | https://<PRD_HOST_B> |
| DB Host | <DB_HOST_B> |
| DB Name | <DB_NAME_B> |
| DB User | <DB_USER_B> |
| ログ保存場所 | <LOG_PATHS_B> |
| SSH踏み台 | <BASTION_IP_B> |
| アプリサーバー | <APP_SERVER_IP_B> |

---

## テスト一覧

| テスト番号 | テスト名 | SQL必要 | 備考 |
|------------|----------|---------|------|
| SC06-02 | オブジェクトレベル認可 | Yes | setup_users.sql, teardown_users.sql |
| SC06-03 | セッション固定化防止 | No | 既存ユーザー使用 |
| SC06-05 | CSRF/CORS/CSP維持 | No | 既存ユーザー使用 |
| SC06-07 | 権限反映の伝播遅延 | Yes | 2フェーズ実行、demote_user.sql |
| SC06-08 | セッション検証レイテンシ | No | 既存ユーザー使用 |
| SC06-09 | 多数同時の権限変更 | Yes | setup_users.sql, teardown_users.sql |
| SC06-11 | Rate Limit検証 | No | ratelimit.enabled=false の場合は429が返らない |
| SC06-13 | シークレット露出なし | No | 既存ユーザー使用 |
| SC06-15 | 監査ログ | Yes | 2フェーズ実行、demote_user.sql |

---

## 事前準備

### 1. DB接続（SSHトンネル例）

```bash
ssh -i <KEY_PATH> -L <LOCAL_PORT>:<DB_HOST>:3306 <USER>@<BASTION_IP>
mysql -h 127.0.0.1 -P <LOCAL_PORT> -u <DB_USER> -p'<DB_PASSWORD>' <DB_NAME>
```

### 2. 環境変数設定

```bash
export PRD_TEST_USERNAME="<USER_EMAIL>"
export PRD_TEST_PASSWORD="<PASSWORD>"
```

---

## テスト実行手順

### 基本的な実行方法

```bash
cd <PROJECT>/CI/qa/k6/k6-tests
./run-test.sh <env> <testNo>
```

### SQLが必要なテストの例

```bash
mysql -h <DB_HOST> -u <DB_USER> -p<PASSWORD> <DB_NAME> < setup_users.sql
ENV=<env> k6 run sc06/SC06-02/sc0602_object_level_auth.js
mysql -h <DB_HOST> -u <DB_USER> -p<PASSWORD> <DB_NAME> < teardown_users.sql
```

---

## ログ確認方法

```bash
# アプリケーションログ
<LOG_PATH_APP>

# セキュリティログ
<LOG_PATH_SECURITY>

# Gatewayアクセスログ
<LOG_PATH_GATEWAY>
```

---

## 結果保存場所

- 各テストディレクトリ: `sc06/SC06-XX/result_<env>.log`
- JSONメトリクス: `sc06/SC06-XX/result_<env>.json`
- 統合結果: `sc06/SC06_TEST_RESULTS.md`

---

## トラブルシューティング（テンプレ）

- 認証エラー: ユーザー/パスワード/ログインAPIパスを確認
- DB接続エラー: ネットワーク/VPN/認証情報を確認
- セッションエラー: 仕様に応じてsleep/ログアウト処理を調整
