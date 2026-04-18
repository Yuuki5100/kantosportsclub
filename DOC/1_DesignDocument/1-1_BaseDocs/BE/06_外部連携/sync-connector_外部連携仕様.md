# sync-connector_外部連携仕様

## 1. 目的
外部システム間のREST通信におけるHMAC署名付き通信方式を整理する。

## 2. 適用範囲
- サーバー間REST連携（送信側・受信側）
- 署名ヘッダによる改ざん検知
- 利用側機能フラグ（`sync.outbox.use`）による送信有効/無効の切替

## 3. 連携概要
### 3-1. 送信側
- 送信ボディをJSON化し、HmacSHA256で署名する。
- 署名値はBase64でエンコードし、`X-Signature` に設定する。
- `SignedRestTemplate` もしくは `SyncSignatureRequestInterceptor` を利用する。

### 3-2. 受信側
- `SyncSignatureVerificationInterceptor` で対象パスの署名を検証する。
- 署名が不正な場合は `SignatureVerificationException` を送出する。

## 4. 接続仕様
| 項目 | 内容 |
|------|------|
| 送信方式 | HTTP POST |
| 署名アルゴリズム | HmacSHA256 |
| 署名エンコード | Base64 |
| 署名ヘッダ | `X-Signature` |
| 対象パス | `sync.signature.target-paths` の設定に従う |

## 5. データ仕様
| 項目 | 内容 |
|------|------|
| 署名対象 | リクエストボディのJSON文字列（UTF-8） |
| 送信ペイロード | 任意DTO（JSON） |

## 6. フロー
1. 送信側がJSONを生成する。
2. `HmacSigner.sign()` で署名を生成する。
3. `X-Signature` に署名を付与してPOST送信する。
4. 受信側が対象パスであれば署名検証を行う。
5. 署名一致なら処理継続、不一致なら401エラーとする。

## 7. エラー・リトライ
| ケース | 挙動 |
|------|------|
| `X-Signature` 欠落 | `SignatureVerificationException`（コード `E4011`） |
| 署名不一致 | `SignatureVerificationException`（コード `E4012`） |
| リクエストラッパ未使用 | `IllegalStateException` |

`SignatureVerificationException` は `GlobalExceptionHandler` により HTTP 401 の `ApiResponse.error` として返却される。

## 8. 設定
### 送信側
```yaml
sync:
  outbox:
    use: true
    max-retry: 10
    fixed-delay-ms: 60000
    dispatch-limit: 100
  remote:
    base-url: ${SYNC_REMOTE_BASE_URL}
  signed-rest:
    secret-key: ${SYNC_SECRET_KEY}
    signature-header: X-Signature
```

### 受信側
```yaml
sync:
  signature:
    enabled: true
    secret: ${SYNC_SECRET_KEY}
    target-paths:
      - /api/secure-endpoint
    signature-header: X-Signature
```

## 9. 利用方法
- 送信側は `SignedRestTemplate.post(...)` で署名付き送信を行う。
- 受信側は `SyncSignatureVerificationConfig` を導入し、対象パスを設定する。

## 10. 制約・注意事項
- `sync.outbox.use=false` の場合、送信要求登録・送信・再送は実施しない。
- `sync.outbox.use=true` で `syncconnector` が classpath に存在しない場合、送信は失敗として記録される。
- `sync.signature.signature-header` は受信検証時に設定値として利用される。

## 11. 要確認事項
- `sync.signature.secret` を正として扱い、`sync.signature.secretKey` は後方互換として併用可能。
- `http.SignedRestTemplateProperties` の残存是非は、設定クラス整理タスクとして別途判断する。

## 12. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 0.1 | 2025/XX/XX | 初版（分解作成） |
