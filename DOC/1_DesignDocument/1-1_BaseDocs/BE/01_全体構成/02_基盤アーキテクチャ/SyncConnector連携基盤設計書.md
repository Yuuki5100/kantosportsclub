# SyncConnector連携基盤設計書

## 1. 目的

`syncconnector` モジュールの責務、構成、署名付き連携方式を整理し、外部システムとの同期連携基盤を把握しやすくする。

## 2. 適用範囲

- 対象モジュール: `BE/syncconnector`
- 関連モジュール: `BE/servercommon`, `BE/appserver`
- 対象機能:
  - HMAC 署名付き HTTP 送信
  - 受信リクエストの署名検証
  - 署名検証失敗時の共通例外応答
  - `sync.outbox.use` による送信有効/無効切替

## 3. モジュール概要

| 項目 | 内容 |
| --- | --- |
| モジュール名 | `syncconnector` |
| 主な責務 | 署名付き同期連携の送信基盤、受信検証基盤 |
| 実行形態 | 独立した Spring Boot アプリケーション |
| ポート | `8084` |
| データアクセス | なし |
| 主な設定 | `sync.signature.*`, `sync.signed-rest.*` |

## 4. 設計方針

### 4-1. 軽量な独立モジュールとして構成する

- `syncconnector` は DB / JPA / Flyway / Batch 自動構成を除外して起動する
- 署名付き同期連携だけに責務を絞り、他サーバーの業務ロジックを持ち込まない

### 4-2. 受信時は Filter と Interceptor を分離する

- `SyncSignatureVerificationConfig` が `ContentCachingRequestWrapper` を適用する Filter を登録する
- 同じ設定クラスで `SyncSignatureVerificationInterceptor` を登録し、対象パスだけ署名検証する
- ボディ再読込の責務と署名検証の責務を分ける

### 4-3. 送信時は署名付きクライアントを部品化する

- `SignedRestTemplateConfig` が `SignedRestTemplate` を Bean 提供する
- 呼び出し元は JSON 変換と HMAC 署名ヘッダ付与を意識せずに POST を実行できる
- `appserver` 側は `sync.outbox.use=false` で送信処理を停止できる

### 4-4. 署名方式を共通化する

- `HmacSigner` が HMAC-SHA256 + Base64 の署名生成と検証を担う
- 送信側と受信側で同じロジックを利用し、計算方式の差異を防ぐ

### 4-5. エラー応答は共通例外基盤に委譲する

- 検証失敗は `SignatureVerificationException` を送出する
- `servercommon` の `GlobalExceptionHandler` が 401 応答へ変換する

## 5. 現行構成

```text
syncconnector
├── SyncConnectorApplication.java
├── config
│   ├── SyncConnectorBeansConfig.java
│   ├── SyncSignatureProperties.java
│   ├── SyncSignatureVerificationConfig.java
│   ├── SignedRestTemplateConfig.java
│   └── SignedRestTemplateProperties.java
├── http
│   └── SignedRestTemplate.java
├── interceptor
│   ├── SyncSignatureRequestInterceptor.java
│   └── SyncSignatureVerificationInterceptor.java
├── signature
│   └── HmacSigner.java
├── sample
│   ├── SyncRequestReceiverSampleController.java
│   └── SyncRequestSenderSample.java
└── model
    ├── SyncRequest.java
    └── SyncResult.java
```

## 6. 主要コンポーネント

### 6-1. `SyncSignatureProperties`

- 受信検証側の設定を保持する
- 主な項目:
  - `enabled`
  - `secret`
  - `target-paths`
  - `signature-header`

### 6-2. `SyncSignatureVerificationConfig`

- 署名検証を有効化する設定クラス
- `enabled=true` のときだけ Interceptor を登録する
- 署名前にボディが読めるよう `ContentCachingRequestWrapper` 用 Filter を先頭で挿入する

### 6-3. `SyncSignatureVerificationInterceptor`

- 対象パスへのリクエストだけ署名検証する
- 署名ヘッダ未指定時は `E4011`
- 署名不一致時は `E4012`

### 6-4. `SignedRestTemplate`

- JSON 化したボディに対し署名を作成し、指定ヘッダへ格納して POST する
- 返却値は `ApiResponse<T>` を想定している

### 6-5. `HmacSigner`

- 署名生成と検証の中心部品
- 比較は簡易な固定時間比較で実施する

## 7. 設定値

| 設定キー | 用途 | 現行実装での利用先 |
| --- | --- | --- |
| `sync.signature.enabled` | 受信検証の有効化 | `SyncSignatureVerificationConfig` |
| `sync.signature.secret` | 受信検証用共有鍵 | `SyncSignatureProperties`, `HmacSigner` |
| `sync.signature.secretKey` | 受信検証用共有鍵（後方互換） | `SyncSignatureProperties.resolveSecret()` |
| `sync.signature.target-paths` | 検証対象パス | `SyncSignatureVerificationInterceptor` |
| `sync.signature.signature-header` | 署名ヘッダ名 | 受信 Interceptor |
| `sync.signed-rest.secret-key` | 送信用共有鍵 | `SignedRestTemplateConfig` |
| `sync.signed-rest.signature-header` | 送信用署名ヘッダ名 | `SignedRestTemplate` |
| `sync.outbox.use` | 送信機能の有効/無効 | `appserver` 側送信基盤 |

## 8. Docker 上の位置づけ

- `docker/compose.yml` の `syncconnector` サービスとして定義されている
- `docker/stack.sh` では `all-in-one-sync` と `instance1-sync` で起動対象になる
- 現状は optional サービスとして扱われる
- `appserver` 単体構成では `syncconnector` 非導入 + `sync.outbox.use=false` を許容する

## 9. 現行実装の制約・留意点

- 検証対象パスは現状 `application*.yml` 上で `/api/sample/receive` のみ
- `SyncRequestReceiverSampleController` と `SyncRequestSenderSample` はサンプル実装であり、業務 API はまだ載っていない
- `SyncSignatureRequestInterceptor` は実装済みだが、現行構成では `SignedRestTemplate` 利用が中心で、実運用の組み込み箇所は未確認
- 署名エラー時のメッセージ本文は `GlobalExceptionHandler` でコードから再解決される

## 10. 関連資料

- `../01_システム全体/Servers.md`
- `../03_処理方式/SyncConnector署名連携_処理方式設計書.md`
