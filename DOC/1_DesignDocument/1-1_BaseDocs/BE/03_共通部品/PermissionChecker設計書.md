# PermissionChecker設計書

## 1. 目的
`METHOD + path` 単位の要求権限とユーザー権限を比較し、Method Security補助経路で利用する共通判定を提供する。

## 2. 適用範囲
- `PermissionChecker`
- `CustomPermissionEvaluator` からの委譲判定
- 旧 `AuthorizationInterceptor` の互換判定

## 3. 依存
- `UserRepository`
- `RolePermissionRepository`
- `PermissionConfigProvider`

## 4. 判定フロー
1. `Authentication` から `UserContext` を解決
2. `roleId` 未設定または未認証は拒否
3. `UserRole.SYSTEM_ADMIN` は常時許可
4. `PermissionConfigProvider.findEndpointPermissions(method, path)` で要求定義取得
5. `custom(menuFunctionId -> requiredLevel)` と `role_permission` の `statusLevelId` を比較
6. 上記で許可されない場合、`permissions` 互換判定（`roleId`/`roleName`）を実施
7. どちらも不一致なら拒否

## 5. レベル比較ルール
- `effectiveRequired = max(requiredLevel引数, endpoint.requiredLevel)`
- ユーザーレベルが `effectiveRequired` 以上なら許可
- `permissionId` が数値でない `custom` キーは無視

## 6. 入力バリエーション
- `checkPermission(authentication, method, path, requiredLevel)`
- `checkPermission(authentication, method, path)`
  - `PermissionConfigProvider.getRequiredLevel("METHOD /path")` を使用

## 7. 仕様上の注意
- エンドポイント定義未一致は拒否（fail closed）
- `CustomUserDetails` 以外のprincipalでも `UserRepository` から補完して判定可能

## 8. 互換方針
- 旧来の `allowedRoles` 判定を残しつつ、正本は `role_permission` 比較とする
- ハードコードされたロールレベル比較は実装しない

## 9. テスト観点
- SYSTEM_ADMIN許可
- エンドポイント未定義拒否
- `role_permission` レベル比較
- `allowedRoles` 互換判定
