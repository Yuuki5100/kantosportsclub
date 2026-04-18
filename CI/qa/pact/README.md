# Pact Pilot（Consumer）

## 実行

```bash
npm ci --prefix CI/qa/pact
npm run pact:consumer --prefix CI/qa/pact
```

## 出力先

- `CI/qa/pact/contracts/*.json`

## 補足

- 本 Pilot は `gateway-provider` の `/test-cors` 契約を対象とする。
- Provider 側の検証は `BE/gateway` の `GatewayPactProviderVerificationTest` で実施する。

## 認証不要エンドポイントのサンプル一括生成

```bash
npm run pact:consumer:samples --prefix CI/qa/pact
npm run pact:consumer:samples:check --prefix CI/qa/pact
```

- 出力先: `CI/qa/pact/contracts-samples/*.json`
- 対象: `allowlist.yml` と appserver の現行 Controller を基にした「認証不要エンドポイント」サンプル
- 差分検知: `allowlist.yml` と `contracts-samples` のパス差分をチェック
- CI: `PACT_PUBLIC_SAMPLES=true` のとき `pact-public-samples-generate` / `pact-public-samples-provider-verify` を手動実行可能。
