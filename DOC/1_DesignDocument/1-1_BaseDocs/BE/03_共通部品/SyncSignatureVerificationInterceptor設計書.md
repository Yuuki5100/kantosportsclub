# SyncSignatureVerificationInterceptor設計書

## 1. 目的
受信側で `X-Signature` を検証し、HMAC署名の妥当性を保証する。

## 2. 適用範囲
- `sync.signature.target-paths` に一致するリクエスト

## 3. モジュール概要
### 3-1. 役割
- 対象パスの署名検証
- 署名不一致時の例外送出

### 3-2. 種別
- `HandlerInterceptor` 実装

## 4. 構成要素
| 種別 | 名称 | 役割 |
|------|------|------|
| Interceptor | `SyncSignatureVerificationInterceptor` | 署名検証 |
| Utility | `HmacSigner` | 署名検証 |
| Config | `SyncSignatureVerificationConfig` | Interceptor登録 |

## 5. 入出力仕様
### 入力
- `HttpServletRequest` のボディ
- `X-Signature` ヘッダ

### 出力
- `boolean`（通過可否）

## 6. 処理フロー
1. リクエストURIが対象パスか判定する。
2. `X-Signature` を取得する。
3. `ContentCachingRequestWrapper` からボディ取得。
4. `HmacSigner.verify` で一致判定する。

## 7. エラー時の扱い
- `X-Signature` 不在: `SignatureVerificationException("E4011")`
- 署名不一致: `SignatureVerificationException("E4012")`
- ボディラッパ不在: `IllegalStateException`

## 8. 依存関係
- `SyncSignatureVerificationConfig`
- `ContentCachingRequestWrapper`

## 9. 利用箇所
- `SyncSignatureVerificationConfig.addInterceptors`

## 10. 実装との整合
- 対象パス判定は `startsWith`。
- ヘッダ名は固定で `X-Signature`。

## 11. 制約・注意事項
- `sync.signature.signature-header` 設定は実装上未使用。

## 12. テスト観点
- 対象パス一致/不一致
- 署名一致/不一致
- ヘッダ欠落

## 13. 要確認事項
- ヘッダ名可変対応の要否

## 14. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 0.1 | 2025/XX/XX | 初版（分解作成） |
