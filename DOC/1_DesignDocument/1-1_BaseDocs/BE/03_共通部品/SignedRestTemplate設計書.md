# SignedRestTemplate設計書

## 1. 目的
`SignedRestTemplate` によるHMAC署名付きPOST送信の共通処理を整理する。

## 2. 適用範囲
- 外部REST送信（HMAC署名必須の通信）
- 利用側で送信機能を有効化した場合（例: `sync.outbox.use=true`）

## 3. モジュール概要
### 3-1. 役割
- リクエストボディをJSON化し署名ヘッダを付与して送信する。

### 3-2. 種別
- Utility（HTTP送信ラッパー）

## 4. 構成要素
| 種別 | 名称 | 役割 |
|------|------|------|
| Utility | `SignedRestTemplate` | 署名付き送信の主処理 |
| Utility | `HmacSigner` | 署名生成 |
| Config | `SignedRestTemplateConfig` | Bean生成 |
| Config | `SignedRestTemplateProperties` | 設定値保持 |

## 5. 入出力仕様
### 入力
- `url`（送信先URL）
- `requestBody`（任意DTO）
- `responseType`（`Class<T>`）

### 出力
- `ApiResponse<T>`（`RestTemplate.exchange` のレスポンスボディ）

## 6. 処理フロー
1. `requestBody` をJSONに変換する。
2. `HmacSigner.sign(json)` で署名を生成する。
3. `signatureHeader` を `HttpHeaders` に設定する。
4. `RestTemplate.exchange` でPOST送信する。

## 7. 設計方針
- 署名ヘッダ名は設定値から注入する。
- `ObjectMapper` を内部で保持する。

## 8. 依存関係
- `RestTemplate`
- `HmacSigner`
- `ApiResponse<T>`

## 9. 利用箇所
- `SyncRequestSenderSample`（デモ用途）
- テスト: `SignedRestTemplateTest`
- `appserver` の Outbox送信（送信機能有効時）

## 10. 実装との整合
- 署名生成は `HmacSigner` を利用。
- ヘッダ名は `props.getSignatureHeader()` から取得。

## 11. 制約・注意事項
- `sync.signed-rest.secret-key` が未設定の場合、Bean生成時にエラーとなる。
- 利用側が送信機能を無効化している場合は、本部品を呼び出さない構成を許容する。

## 12. テスト観点
- ヘッダ付与の検証
- 空ボディの署名
- 例外発生時の挙動

## 13. 要確認事項
- `http.SignedRestTemplateProperties` の利用有無

## 14. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 0.1 | 2025/XX/XX | 初版（分解作成） |
