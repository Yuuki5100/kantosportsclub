# 認証・認可モジュール設計書（rolePermission）

## 1. 目的
認可判定のデータモデルとクラス責務を、実装準拠で整理する。

## 2. 対象
- `PermissionConfigProvider` 系
- `PermissionChecker` 系
- `RequirePermissionInterceptor` / `RolePermissionChecker`

## 3. データモデル

### 3-1. `endpoint_authority_mapping`
- キー: `method`, `url`
- 値: `menuFunctionId`, `requiredLevel`
- 用途: エンドポイントが要求する権限レベル定義（正本）

### 3-2. `role_permission`
- キー: `roleId`, `permissionId`
- 値: `statusLevelId`
- 用途: ロールが保有する権限レベル定義（正本）

## 4. クラス責務

| クラス | 役割 |
| --- | --- |
| `PermissionConfigProviderImpl` | `endpoint_authority_mapping` を `Map<String, EndpointPermissions>` にロード |
| `PermissionChecker` | `METHOD + path` をキーに要求レベル判定（Method Security補助） |
| `CustomPermissionEvaluator` | Method Security式入力を解釈し `PermissionChecker` へ委譲 |
| `RequirePermissionInterceptor` | `@RequirePermission` を強制する標準認可入口 |
| `RolePermissionChecker` | `role_permission` 参照で最終判定 |

## 5. 判定仕様

### 5-1. `@RequirePermission` 標準経路
- 注釈が無い protected endpoint は `EX_REQUIRE_PERMISSION_MISSING` で拒否
- `role_permission(roleId, permissionId)` の `statusLevelId` が要求値以上で許可

### 5-2. Method Security補助経路
- `CustomPermissionEvaluator` は `"METHOD /path"` または `"/path"` を受付
- `"/path"` の場合は `security.permission.method-security-default-method` を補完
- エンドポイント未定義時の扱いは `security.permission.method-security-allow-if-unmapped` で制御

### 5-3. SYSTEM_ADMIN特例
- `PermissionChecker` では `UserRole.SYSTEM_ADMIN` を常時許可

## 6. キャッシュ再読込
- `PermissionConfigProviderImpl.refresh()` で再ロード
- `@Scheduled(fixedDelayString="${security.permission.cache-refresh-fixed-delay-ms:600000}")`

## 7. 旧実装の扱い
- `AuthorizationInterceptor` は互換用途（デフォルト無効）
- `EndpointPermissionConfig` は互換用途（デフォルト無効）

## 8. テスト観点
- SYSTEM_ADMINの全許可
- `role_permission` レベル比較
- `METHOD + path` のAntパターン一致
- 未定義エンドポイント時の許可/拒否切替
