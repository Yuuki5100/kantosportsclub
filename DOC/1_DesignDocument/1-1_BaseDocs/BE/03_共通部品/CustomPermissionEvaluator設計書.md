# CustomPermissionEvaluator設計書

## 1. 目的
Method Security（`@PreAuthorize`）で利用する認可判定を、`PermissionChecker` へ委譲する統一入口として提供する。

## 2. 適用範囲
- `CustomPermissionEvaluator`
- `MethodSecurityConfig`

## 3. 入力仕様
- `targetDomainObject`: `"METHOD /path"` または `"/path"`
- `permission`: 必要レベル（数値）

## 4. 解釈ルール
- 正規表現 `^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+(.+)$` に一致すれば method/path を採用
- method省略時は `security.permission.method-security-default-method` を採用
- `permission` が数値化不可なら拒否

## 5. 判定ルール
1. 認証済みでない場合は拒否
2. `EndpointTarget` 解決不可なら拒否
3. `security.permission.method-security-allow-if-unmapped=true` かつ
   `PermissionConfigProvider.findEndpointPermissions()` が未定義なら許可
4. それ以外は `PermissionChecker.checkPermission()` へ委譲

## 6. 設定値

| キー | 既定値 | 用途 |
| --- | --- | --- |
| `security.permission.method-security-allow-if-unmapped` | `true` | 未定義時の許可/拒否 |
| `security.permission.method-security-default-method` | `GET` | method省略時の既定値 |

## 7. 互換方針
- 既存の `@PreAuthorize("@customPermissionEvaluator...")` 式は継続利用可能
- ただし標準経路は `@RequirePermission` とし、Method Security は補助経路として運用

## 8. テスト観点
- `METHOD /path` 入力解析
- method省略時の既定補完
- 未定義許可トグル
- `permission` 不正時拒否
