
# ✅ フロントエンド（Next.js）デプロイ手順

## 1. `next.config.ts` の設定

```ts
const nextConfig: NextConfig = {
  output: "export",  // ← 静的出力
  images: {
    domains: ["www.j-ems.jp"],
    unoptimized: true  // ← exportモードでは必須
  },
  productionBrowserSourceMaps: true,
};
```

> ❗`rewrites()` は SSR 向けなので `export` モードでは無視されます。削除またはコメントアウトが無難。

---

## 2. `.env.local` の設定

```env
NEXT_PUBLIC_API_BASE_URL=/api  # ← フロントのnginx経由で叩く
NEXT_PUBLIC_API_TIMEOUT=10000
```

> ❗ **相対パス `/api` にすることで nginx の proxy\_pass が効く**

---

## 3. ビルド ＆ 静的出力

```bash
npm run build
```

→ `output: "export"` により自動的に `out/` フォルダが生成される
（`next export` は Next.js v15.3 以降では不要）

---

## 4. nginx の設定例

```nginx
server {
    listen 3000;
    server_name _;

    location / {
        root   /apps/frontend;
        index  index.html;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8081/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10M;
}
```

> `/apps/frontend` に `out/` の中身を配置

---

## 5. `out/` フォルダの配置（例）

```bash
sudo cp -r ./out/* /apps/frontend/
```

> `/apps/frontend/index.html` があれば OK

---

## 6. nginx 再起動

```bash
sudo systemctl restart nginx
```

---

# ✅ バックエンドAPI 側の手順（Spring Boot など想定）

## 1. API サーバーの systemd サービス化例

`/etc/systemd/system/appserver.service`:

```ini
[Unit]
Description=Backend App Server
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/apps/backend
ExecStart=/usr/bin/java -jar app.jar
Restart=always
Environment=SPRING_PROFILES_ACTIVE=prod
EnvironmentFile=/apps/backend/.env

[Install]
WantedBy=multi-user.target
```

> `.env` でポートや環境変数を指定しているなら `EnvironmentFile` 必須

---

## 2. API 起動

```bash
sudo systemctl daemon-reexec
sudo systemctl restart appserver
```

---

## 3. ポート確認（例）

```bash
curl http://localhost:8081/api/health
```

---

## ⚠️ 注意点・落とし穴

| 項目                   | 説明                                                                |
| -------------------- | ----------------------------------------------------------------- |
| `.env.local`         | Next.js のビルド時にのみ有効（nginxには無関係）                                    |
| `rewrites()`         | `output: "export"` の場合は効果なし（代わりに nginx でルーティング）                   |
| `Image Optimization` | 静的エクスポートでは `images.unoptimized = true` が必須                        |
| フロントのAPI URL         | `NEXT_PUBLIC_API_BASE_URL=/api` のようにしておく                          |
| index.html がない       | `pages/index.tsx` があればビルド時に `index.html` は生成される（存在しない場合はビルド結果を確認） |
| `node_modules` の配置   | **静的エクスポートのみの場合、不要**。SSR や `next start` を使う場合は必要                  |

---

### デプロイ手順（2025/09/19）案件終わり際に設計書見直し予定

**servercommonのビルド**
```sh
cd BE/servercommon
mvn clean install -DskipTests
```

**appserverのビルド**
```sh
cd BE/appserver
mvn clean package -DskipTests
```

**FrontEndのビルド**
```sh
cd FEG/spa-next/my-next-app
npm run build:dev
```

 **バックエンド**
```sh
コピー元：(Git等) BE/appserver/target/appserver-1.0.0-SNAPSHOT.jar
```

```
コピー先：(SSH) /apps/appserver/appserver-1.0.0-SNAPSHOT.jar
```
 **フロントエンド**

```
コピー元；(Git等) FE/spa-next/my-next-app/out
```

```
コピー先；(SSH) /apps/FrontEnd
```

**S3等のクラウドサービスにテンプレートの配置**（基本コピペするだけ）  
```
1. SSH接続アプリを起動する  
2. AWS（以降S3）に接続する（接続情報.xlsxに接続情報あり）  
3. S3の特定のディレクトリに移動  
4. （Git等）BE/templeteディレクトリに存在するファイルをS3にアップロードする  
```


 **サーバーへの接続**
 * 踏み台サーバーありの場合
```sh
ssh -o ProxyCommand="ssh -i C:\key\CRJ\crj-stg-jems.pem -W %h:%p jems@3.113.101.216" -i C:\key\CRJ\crj-stg-jems.pem jems@10.0.12.152
```
 * 踏み台サーバーなしの場合
```sh
ssh -i "C:\Users\E1372.ES\Downloads\開発環境\開発環境\crj-dev-jems-web.pem" jems@52.69.199.241
```

 **EC2サーバーでの操作（powershell）**
```sh
##フロントエンドの再起動
sudo systemctl restart nginx  
##バックエンドの再起動
sudo systemctl restart appserver  
##サービス起動確認
sudo systemctl status nginx or appserver  
```

 * バックエンドのリアルタイムログ。起動確認などの確認に便利
```sh
sudo journalctl -u appserver -f
```

 * 備考
  * 開発→application-dev.yml
  * 検証→application-uat.yml
  * 本番→application-prd.yml


---

## 躓いたことリスト

### SSH接続しているサーバーは、正しいか？
 * 操業管理か？入出庫か？appserverか？batchserverか？

### 配置したファイルは、そのサーバーに対して正しいファイルを配置しているか？
 * 操業管理に入出庫のjarを配置していないか？

### EC2で接続しているサーバーは正しいか？
 * 誤って違うサーバにアクセスしていないか？  
   操業管理を再起動したいのに、入出庫を再起動してたりとか。  
   
### ポートの競合（ログ：アドレスは既に使用中です）
```bash
起動コマンド
  # 1. 8083 （競合ポート）を使っているプロセスを調べる
sudo kill -9 $(sudo lsof -t -i :8083)
  # 2. 念のためこちらも実行
sudo systemctl stop batchserver.service
  # 3. 再起動
sudo systemctl restart batchserver.service
```
### エラー出て永遠と無限ループしてる  
とりまログレベルを **INFO** にして、根本エラーを突き止めましょう
```bash
logging:
  level:
    root: INFO
    org.apache.http.wire: OFF
    org.apache.http.headers: INFO
```
---
