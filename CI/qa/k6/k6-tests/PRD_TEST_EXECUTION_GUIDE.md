# PRD環境 k6テスト実行ガイド（テンプレート）

## 環境情報

| 項目 | 値 |
|------|-----|
| PRD URL | https://<PRD_HOST> |
| DEV URL | http://<DEV_HOST> |
| テストユーザー | <USER_EMAIL> / <PASSWORD> |

---

## 前提条件

### 1. Nginx設定（必要な場合）

```nginx
location /ext/ {
    proxy_pass http://<UPSTREAM>/ext/;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Gateway-Token   trusted;
}
```

### 2. APIエンドポイントの差分

| 機能 | DEV | PRD |
|------|-----|-----|
| ログイン | <DEV_LOGIN_PATH> | <PRD_LOGIN_PATH> |
| 通常API | /api/xxx | /api/xxx |
| 外部API | /ext/xxx | /ext/xxx |

---

## テスト実行コマンド（例）

```bash
TARGET_URL="https://<PRD_HOST>" \
k6 run <TEST_FILE.js>
```

---

## テストデータ投入方法（例）

```bash
ssh -i <KEY_PATH> -L <LOCAL_PORT>:<DB_HOST>:3306 <USER>@<BASTION_IP>
mysql -h 127.0.0.1 -P <LOCAL_PORT> -u <DB_USER> -p'<DB_PASSWORD>' <DB_NAME> < /path/to/file.sql
```

---

## トラブルシューティング

- 405 Not Allowed: Nginxのlocation設定を確認
- 400 Bad Request: テストデータの不足を確認
- 401 Unauthorized: ログインAPIのパスと認証情報を確認
- k6 SyntaxError: k6の対応構文を確認（ES2020非対応の場合あり）
