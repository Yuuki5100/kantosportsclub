# 予約管理APIセキュリティ

## 1. 目的
予約管理系APIの認可を、現行の共通認可基盤（`@RequirePermission`）に揃えて運用する。

## 2. 適用範囲
- 予約管理API（appserver）
- 認証済みリクエストに対する認可判定

## 3. 判定方式
- 標準経路: `@RequirePermission -> RequirePermissionInterceptor -> RolePermissionChecker`
- 判定データ:
  - 要求権限: Controller注釈の `permissionId`, `statusLevelId`
  - 保有権限: `role_permission`

## 4. 判定ルール
1. SecurityFilterChainで認証済みであること
2. 保護対象APIに `@RequirePermission` が付いていること
3. `role_permission(roleId, permissionId).statusLevelId >= required statusLevelId` を満たすこと
4. いずれか未達の場合は403

## 5. 実装メモ
- `PermissionCheckerV2` 前提の仕様は廃止
- APIごとの権限文字列管理（`role_list`）は採用しない
- ロールID直比較ではなく、`role_permission` のレベル比較を使用

## 6. テスト観点
- 参照権限（statusLevel=2）で取得APIが許可される
- 更新権限（statusLevel=3）不足時に更新APIが拒否される
- 注釈未設定メソッドが拒否される
