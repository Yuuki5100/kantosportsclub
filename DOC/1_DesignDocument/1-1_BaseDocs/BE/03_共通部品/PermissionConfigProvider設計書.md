# PermissionConfigProvider設計書

## 1. 目的
エンドポイント権限定義をDB正本から読み出し、認可判定で再利用できる形に変換して提供する。

## 2. 適用範囲
- `PermissionConfigProvider`
- `PermissionConfigProviderImpl`
- `PermissionConfigProvider.EndpointPermissions`

## 3. 構成要素

| 種別 | 名称 | 役割 |
| --- | --- | --- |
| Interface | `PermissionConfigProvider` | 権限定義参照API |
| Component | `PermissionConfigProviderImpl` | DBロードとキャッシュ保持 |
| Repository | `EndpointAuthorityMappingRepository` | `endpoint_authority_mapping` 取得 |
| Model | `EndpointPermissionsImpl` | `custom` / `defaultLevel` 保持 |

## 4. 入出力仕様

### 4-1. 入力
- `endpoint_authority_mapping` 一覧（`method`, `url`, `menuFunctionId`, `requiredLevel`）

### 4-2. 出力
- `Map<String, EndpointPermissions>`
- キー形式: `"METHOD /path"`

## 5. 処理仕様
1. 起動時 `@PostConstruct` で `refresh()` 実行
2. `findAll()` 結果を `method.toUpperCase() + " " + url` でグルーピング
3. `menuFunctionId -> requiredLevel` を `custom` に集約（同一キー重複時は最大値）
4. `defaultLevel` は `custom` の最大値（未定義時 `0`）
5. 読込結果を `unmodifiableMap` として差替

## 6. 再読込
- `@Scheduled(fixedDelayString = "${security.permission.cache-refresh-fixed-delay-ms:600000}")`
- 実運用で即時反映が必要な場合は `refresh()` を明示呼び出しする

## 7. 検索仕様
- `findEndpointPermissions(method, path)` は `AntPathMatcher` を使用
- パターン定義例: `GET /api/user/**`
- 入力 `method` / `path` が null の場合は `Optional.empty()`

## 8. 互換仕様
- `EndpointPermissionConfig`（in-memory）とは独立
- `EndpointPermissionConfig` は `security.permission.legacy-endpoint-config-enabled=true` 時のみ有効

## 9. テスト観点
- DBロード結果のグルーピング
- 重複 `menuFunctionId` の最大値採用
- Antパターン一致
- 再読込後のキャッシュ差替
