# HmacSigner設計書

## 1. 目的
`HmacSigner` によるHMAC署名生成・検証を共通化する。

## 2. 適用範囲
- 送信署名生成
- 受信署名検証

## 3. モジュール概要
### 3-1. 役割
- HmacSHA256による署名生成と検証を行う。

### 3-2. 種別
- Utility

## 4. 構成要素
| 種別 | 名称 | 役割 |
|------|------|------|
| Utility | `HmacSigner` | 署名生成・検証 |

## 5. 入出力仕様
### 入力
- `sign(data)` に渡す文字列（UTF-8）
- `verify(data, providedSign)`

### 出力
- `sign` はBase64署名文字列
- `verify` は `boolean`

## 6. 処理フロー
1. `HmacSHA256` でMACを生成する。
2. 署名はBase64でエンコードする。
3. `verify` は一定時間比較で一致判定する。

## 7. 設計方針
- HMACアルゴリズムは固定で `HmacSHA256`。

## 8. 依存関係
- `javax.crypto.Mac`
- `java.util.Base64`

## 9. 利用箇所
- `SignedRestTemplate`
- `SyncSignatureRequestInterceptor`
- `SyncSignatureVerificationInterceptor`
- `SyncRequestSenderSample`
- `SyncRequestReceiverSampleController`

## 10. 実装との整合
- エンコードは `Base64.getEncoder().encodeToString` を使用。

## 11. 制約・注意事項
- 署名対象のJSON正規化は呼び出し側責務。

## 12. テスト観点
- 正常署名一致
- 署名不一致
- 文字列長不一致

## 13. 要確認事項
- 署名対象文字列の統一ルール

## 14. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 0.1 | 2025/XX/XX | 初版（分解作成） |
