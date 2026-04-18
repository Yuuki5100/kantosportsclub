# 📄 認可ロジック テスト仕様書（PermissionChecker / CustomPermissionEvaluator）

## 🧩 対象モジュール
- `PermissionChecker.java`（グループレベル・ロール判定）
- `CustomPermissionEvaluator.java`（Spring Security Expression 用の評価クラス）

---

## ✅ テスト目的

- ユーザーのロール種別（SYSTEM_ADMIN / 通常ロール / CUSTOM）に応じて、適切にアクセス判定できること
- 設定されたエンドポイント定義に基づき、権限レベルやロール許可に従ったアクセス判定が行えること
- 大文字・小文字の一致を厳密でなく `.equalsIgnoreCase()` で処理している仕様に準拠すること
- `CUSTOM` ロールのパターンにおける `"group"` と `"requiredLevel"` の比較動作を網羅すること

---

## ✅ テストケース一覧（PermissionCheckerTest）

| No | テスト名 | 説明 | 入力条件 | 期待結果 |
|----|----------|------|----------|----------|
| 1 | `systemAdmin_returnsTrue` | SYSTEM_ADMIN ロールは無条件で許可される | ロール：SYSTEM_ADMIN | `true` |
| 2 | `customUser_withSufficientLevel_returnsTrue` | CUSTOMユーザーが要求レベル以上の権限を保持 | `"admin"=5`, required=3 | `true` |
| 3 | `customUser_withInsufficientLevel_returnsFalse` | CUSTOMユーザーがレベル不足の場合 | `"user"=1`, required=3 | `false` |
| 4 | `customUser_groupNotMatched_returnsFalse` | CUSTOMで `"admin"` / `"user"` グループが見つからない | `"othergroup"`=x | `false` |
| 5 | `normalRole_grantedByConfig_returnsTrue` | allowedRoles にロールが含まれる通常ユーザー | ロール："VIEWER" | `true` |
| 6 | `normalRole_caseInsensitiveMatch_returnsTrue` | allowedRoles に小文字が含まれるケース | `"viewer"` vs `"VIEWER"` | `true` |
| 7 | `nonCustomUserDetailsPrincipal_returnsUserFromRepo` | Spring 標準 `UserDetails` でも評価される | ロール："EDITOR" | `true` |
| 8 | `unauthenticated_returnsFalse` | 認証情報が存在しない | `authentication == null` | `false` |
| 9 | `endpointNotConfigured_returnsFalse` | 設定されていないエンドポイントの場合 | `/not-found` | `false` |

---

## ✅ テストケース一覧（CustomPermissionEvaluatorTest）

| No | テスト名 | 説明 | 入力条件 | 期待結果 |
|----|----------|------|----------|----------|
| 1 | `hasPermission_withNulls_returnsFalse` | 引数が null の場合 | `null` or 不正入力 | `false` |
| 2 | `hasPermission_withNonIntegerPermission_returnsFalse` | `permission` が数値以外 | `"invalid"` | `false` |
| 3 | `checkPermission_allowsSystemAdmin` | SYSTEM_ADMIN は常に許可 | ロール：SYSTEM_ADMIN | `true` |
| 4 | `checkPermission_allowsIfEndpointNotConfigured` | エンドポイントが定義されていない場合 | `/not/exist` | `true` |
| 5 | `checkPermission_withCustomRole_andEnoughLevel_returnsTrue` | CUSTOM の権限が sufficient | `"USER"=2`, required=2 | `true` |
| 6 | `checkPermission_withCustomRole_andInsufficientLevel_returnsFalse` | CUSTOM の権限が不足 | `"USER"=1`, required=2 | `false` |
| 7 | `checkPermission_allowedRolesMatch_returnsTrue` | allowedRoles に一致（大文字） | ロール：VIEWER | `true` |
| 8 | `checkPermission_noAllowedRoles_noCustomPermissions_returnsFalse` | 許可ロールもカスタム設定もなし | `/admin/panel` → 権限なし | `false` |
| 9 | `checkPermission_customUser_noCustomPermission_butAllowedRole_returnsTrue` | CUSTOM だけど allowedRoles に一致 | ロール：CUSTOM、customPermissions 無し | `true` |
| 10 | `checkPermission_caseInsensitiveRoleMatch_returnsTrue` | allowedRoles が小文字、ロールが大文字 | `"viewer"` vs `"VIEWER"` | `true` |

---

## ✅ 補足事項

- **リソースキーの正規化**や `"admin"` / `"user"` の優先順位は、`PermissionChecker#determineEffectiveGroup` に準拠
- **テスト対象モジュール**は全て `Mock` で注入し、依存性を明確に分離
- `permissionMap`（Evaluator）と `PermissionConfigProvider`（Checker）は明確に役割分担されており、それぞれに応じた責務を検証

---

## ✅ 使用技術・ライブラリ

- `JUnit 5 (Jupiter)`
- `Mockito` を用いた依存モック化
- `Spring Security` の `TestingAuthenticationToken` による認証状態の模擬
- `Map.of(...)` による定義の簡素化（Java 9+）

---

## ✅ 今後のテスト拡張例（参考）

| 拡張項目 | テスト内容例 |
|----------|--------------|
| ログイン後のセッション有効性 | `/auth/status` の返却値検証 |
| ユーザーの rolePermissions 表示 | CustomUserDetails のレスポンス表示検証 |
| 無効なリソースアクセス試行 | `/admin/panel` へのアクセス試行時の 403 確認 |

---

