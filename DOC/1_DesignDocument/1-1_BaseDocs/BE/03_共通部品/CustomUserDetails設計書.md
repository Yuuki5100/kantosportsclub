# CustomUserDetails設計書

## 1. 目的
`CustomUserDetails` の保持情報と Spring Security 連携責務を明確化する。

## 2. 適用範囲
認証済みユーザー情報の保持・参照。

## 3. モジュール概要
### 3-1. 役割
- `UserDetails` 実装として認証済みユーザー情報を保持する。
- `rolePermissions` を認可判定に提供する。

### 3-2. 種別
- `UserDetails` 実装。

## 4. 構成要素
| 種別 | 名称 | 役割 |
|------|------|------|
| Model | `CustomUserDetails` | 認証済みユーザー情報の保持 |
| Service | `CustomUserDetailsService` | `CustomUserDetails` の生成 |

## 5. 入出力仕様
### 入力
- `UserModel`
- `Map<Integer, Integer> rolePermissions`

### 出力
- `UserDetails` としての認証情報

## 6. 処理フロー
1. `CustomUserDetailsService.loadUserByUsername` が `UserModel` を取得する。
2. `RolePermissionRepository` から `rolePermissions` を構築する。
3. `CustomUserDetails` を生成し返却する。

## 7. 設計方針
- `roleId` を `roleName` に解決し `ROLE_` 付き権限を返却する。
- `rolePermissions` は CUSTOM 判定の入力として維持する。

## 8. 依存関係
- `UserRepository`
- `RolePermissionRepository`

## 9. 利用箇所
- `PermissionChecker`
- `CustomPermissionEvaluator`
- `InternalAuthFlow`

## 10. 実装との整合
- `getUsername()` は `userId` を返却する。
- `getAuthorities()` は `ROLE_{roleName}` または `ROLE_{roleId}` を返却する。
- `rolePermissions` は `permissionId -> statusLevelId` のMap。

## 11. 制約・注意事項
- `roleId` が `null` の場合、権限は空となる。
- `rolePermissions` が空の場合、CUSTOM判定で拒否になる。

## 12. テスト観点
- `roleId` が `null` の場合の `getAuthorities()`。
- `roleName` 解決の有無による権限名。
- `rolePermissions` の空/非空の分岐。

## 13. 要確認事項
- `rolePermissions` の空扱いが運用上問題ないか。

## 14. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 0.1 | 2025/XX/XX | 初版（分解作成） |
