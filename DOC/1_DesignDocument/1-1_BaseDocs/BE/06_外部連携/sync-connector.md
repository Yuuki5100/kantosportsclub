# 📦 `sync-connector` モジュール設計ドキュメント（完全版）

## 1. モジュール概要

`sync-connector` は、複数の独立システム間における **HMAC署名付き通信** を提供する共通Javaモジュールです。改ざん検出や認証性強化を目的とし、RESTベースのサービス間通信において、リクエスト署名の **付与（送信側）** および **検証（受信側）** を実現します。
送信機能は利用側の機能フラグで無効化できる前提とし、未使用システムでは本モジュールを依存に含めない構成も許容します。

| 項目     | 内容                                           |
| ------ | -------------------------------------------- |
| モジュール名 | `sync-connector`                             |
| 主な目的   | HMAC署名付き通信によりサーバー間の改ざん検出・認証性を実現              |
| 利用対象   | `appserver`, `batchserver` など、複数の内部マイクロサービス群 |
| 特徴     | `servercommon` とは責務分離し、署名通信専用モジュールとして独立      |
| 導入方針   | 連携が必要なシステムのみ導入（不要システムは未導入可）                  |

---

## 2. 提供機能と構成

### ✅ 機能一覧

| 送信側                  | 説明                                       |
| -------------------- | ---------------------------------------- |
| `SignedRestTemplate` | HMAC署名を付与してリクエスト送信する `RestTemplate` ラッパー |
| `SyncRequest<T>`     | 汎用的な署名対象DTO                              |
| `HmacSigner`         | HMAC署名の生成・検証ユーティリティ                      |

| 受信側                                    | 説明                             |
| -------------------------------------- | ------------------------------ |
| `SyncSignatureVerificationInterceptor` | HMAC署名を検証する Spring Interceptor |
| `ContentCachingRequestWrapper`         | リクエストボディの再取得用に Filter で適用      |
| `SyncResult`                           | 統一されたレスポンスDTO（成功／失敗＋メッセージ）     |

---

### 📁 パッケージ構成

```
sync-connector/
├── model/                # 通信に使うDTO（SyncRequest, SyncResult）
├── http/                 # RestTemplateラッパー
├── interceptor/          # シグネチャ検証Interceptor
├── signature/            # HMAC署名ロジック
├── config/               # 設定クラス・プロパティ読み込み
├── exception/            # カスタム例外
└── sample/               # サンプル送受信コード
```

---

## 3. HMAC署名の仕様

| 項目        | 内容                        |
| --------- | ------------------------- |
| アルゴリズム    | `HmacSHA256`              |
| 対象データ     | リクエストボディ（JSONなど）          |
| 署名出力      | Base64 エンコード文字列           |
| デフォルトヘッダー | `X-Signature`（プロパティで変更可能） |

---

## 4. application.yml 設定例

```yaml
sync:
  outbox:
    use: true
  signature:
    secret: ${SYNC_SECRET_KEY}
    secretKey: ${SYNC_SECRET_KEY} # 後方互換キー
    signature-header: X-Signature
    target-paths:
      - /api/inventory/sync
      - /api/master/sync
  signed-rest:
    secret-key: ${SYNC_SECRET_KEY}
    signature-header: X-Signature
```

### ⛳ 環境変数例

```env
SYNC_SECRET_KEY=super-secret-key
```

---

## 5. 利用方法（送信側）

### 送信コード例

```java
@Autowired
private SignedRestTemplate signedRestTemplate;

public void send() {
    SyncRequest<MyDto> request = SyncRequest.of("inventory-sync", dto, Instant.now());
    SyncResult result = signedRestTemplate.post("/api/inventory/sync", request, SyncResult.class);
}
```

---

## 6. 利用方法（受信側）

* application.yml に `target-paths` を定義するだけで有効化される
* 該当パスに対して `SyncSignatureVerificationInterceptor` が署名検証を実施
* 通常の Spring MVC Controller にそのまま適用可能

### エラー時の挙動

| 条件                    | 例外                               | エラーコード  |
| --------------------- | -------------------------------- | ------- |
| `X-Signature` ヘッダーがない | `SignatureVerificationException` | `E4011` |
| 署名が一致しない              | `SignatureVerificationException` | `E4012` |
| リクエストボディの取得失敗         | `IllegalStateException`          | -       |

---

## 7. テスト戦略

| 対象                       | テスト内容                               |
| ------------------------ | ----------------------------------- |
| `HmacSignerTest`         | `sign()`, `verify()` の正常・改ざん・長さ違いなど |
| `SignedRestTemplateTest` | ヘッダー付与、空ボディ、例外時の挙動など全パターン網羅         |
| `InterceptorTest`        | MockMvc による署名一致・不一致時の検証             |
| モデル (`SyncRequest`)      | UUID生成, getter/setter の確認（自動テストで十分） |

---

## 8. エラーハンドリングとレスポンス統一

`SignatureVerificationException` は `servercommon` 側の `GlobalExceptionHandler` にて処理され、以下の形式で返却：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "E4012",
    "message": "Invalid signature"
  }
}
```

---

## 9. 導入方法（依存追加）

`sync.outbox.use=true` で署名付き送信を有効化するシステムでは、利用側（例: appserver）で `pom.xml` に依存を追加する。
`sync.outbox.use=false` のシステムでは依存追加は不要。

```xml
<dependency>
  <groupId>com.example</groupId>
  <artifactId>sync-connector</artifactId>
  <version>1.0.0</version>
</dependency>
```

## 10. 📄 送信側のDB設計（冪等性・監査目的）

`sync-connector` を **送信側** で使用する際、**冪等性の担保**や**送信履歴の監査ログ**を目的として、以下のようなテーブルを追加することを推奨します。
※ **受信側にはテーブル追加は不要**です（署名検証のみで完結）

### 📌 テーブル例：`sync_outbox_log`

| カラム名           | 型           | 説明                                |
| -------------- | ----------- | --------------------------------- |
| `id`           | BIGINT (PK) | 識別子                               |
| `request_id`   | VARCHAR(36) | 冪等性ID（`SyncRequest#requestId`と対応） |
| `request_type` | VARCHAR(50) | 処理種別（inventory-sync 等）            |
| `payload`      | TEXT / JSON | 実際の送信ペイロード                        |
| `timestamp`    | DATETIME    | リクエスト発行時刻                         |
| `status`       | VARCHAR(20) | 成功, 失敗, リトライ待ち など                 |
| `response`     | TEXT / JSON | 応答内容（エラー時のメッセージ等）                 |
| `sent_at`      | DATETIME    | 実際の送信時刻                           |
| `retry_count`  | INT         | リトライ回数                            |

### 🎯 利用目的

| 目的      | 説明                                        |
| ------- | ----------------------------------------- |
| 冪等性の担保  | 同一 `requestId` の再送をブロック可能                 |
| 監査証跡の保存 | いつ・誰が・どのデータを送ったかを記録可能                     |
| 障害復旧/再送 | リトライ処理や死活監視対象として利用可能（例：batchで未送信レコードのみ再送） |

---
## 注記（分解済み参照先）
- 外部連携仕様: `DOC/1_DesignDocument/1-1_BaseDocs/BE/06_外部連携/sync-connector_外部連携仕様.md`
- 共通部品: `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/SignedRestTemplate設計書.md`
- 共通部品: `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/HmacSigner設計書.md`
- 共通部品: `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/SyncSignatureVerificationInterceptor設計書.md`
- DB定義: `DOC/1_DesignDocument/1-1_BaseDocs/BE/08_状態_コード定義/sync_outbox_log定義書.md`
