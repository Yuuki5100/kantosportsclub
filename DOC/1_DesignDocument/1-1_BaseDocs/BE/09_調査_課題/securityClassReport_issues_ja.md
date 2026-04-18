# セキュリティ設計の問題点・改善案（appserver）

## 対象範囲
- `BE/appserver` のセキュリティ実装
- `security.auth.mode` により JWT / Session のどちらかが有効

## 問題点と改善案
### 1. JWT / Session モードで許可パスの定義が微妙にズレる
- 問題点: `JwtSecurityConfig` と `SessionSecurityConfig` の allowlist が完全一致していない。
- 影響: モード切替でアクセス可否が変わる可能性。
- 改善案: allowlist を共通化し、1 箇所で定義・参照する。

### 2. Filter の除外条件と allowlist が二重定義
- 問題点: `TokenRefreshFilter.shouldNotFilter` / `SessionCheckFilter.publicMatcher` と `authorizeHttpRequests` が重複。
- 影響: 片方だけ更新されると挙動不整合が発生。
- 改善案: Filter 側の除外を最小化し、許可判定は `authorizeHttpRequests` に集約する。

### 3. `LoggingFilter` の実行順が不定
- 問題点: `LoggingFilter` に order が明示されていない。
- 影響: Security FilterChain の前後が環境依存で変わり、ログ順序が不安定。
- 改善案: `FilterRegistrationBean` で order を明示する。

### 4. DB 依存の Session 除外パス
- 問題点: `SessionCheckFilter` が DB の除外パスに依存。
- 影響: 実行時に挙動が変わる、障害時に認証経路が不安定になる。
- 改善案: DB 除外は用途限定にし、キャッシュ化 or allowlist に統合する。

### 5. 未使用クラスの残存
- 問題点: `JwtAuthenticationFilter` が実行経路に入らない。
- 影響: 実装の意図が不明確になり、保守コスト増。
- 改善案: 削除 or `TokenRefreshFilter` と統合する方針を決める。

### 6. 認可の責務分散
- 問題点: `authorizeHttpRequests` と `AuthorizationInterceptor` が二重に認可を実施。
- 影響: どちらが正なのか分かりにくく、設定漏れの原因になる。
- 改善案: 認可を 1 箇所に集約（FilterChain or Interceptor のどちらかに統一）。

### 7. エラー応答の不一致
- 問題点: `TokenRefreshFilter` は 401 ステータスのみ、`SessionCheckFilter` は JSON を返す。
- 影響: クライアント側の扱いが複雑化。
- 改善案: 共通のエラーレスポンスフォーマットに統一する。

### 8. モード分岐による拡張コスト
- 問題点: JWT / Session で挙動が分離されているため、変更が 2 箇所になりやすい。
- 影響: 将来の追加・修正が重複しやすい。
- 改善案: 共通化できる設定や処理を切り出し、モード依存部分のみ分岐。

## 決定事項（現時点）
- LoggingFilter の位置は **Security FilterChain より前**。
- JWT / Session 共通化の境界は **Filter と exceptionHandling まで含める**。
- 認可の集約先は **Interceptor**。
- DB 除外パスは **allowlist に統合が基本方針**。
- Filter 最小化後の扱いは **残す（最小責務に縮小）**。
  - TokenRefreshFilter: 認証情報の抽出と SecurityContext 付与のみ
  - SessionCheckFilter: セッション有無チェックのみ
  - 認可・除外判定は authorizeHttpRequests / Interceptor に集約

## 要議論（未決）
- DB 除外パスの目的（「DB を見れば仕様と実装の差異が理解できる」）を、allowlist 統合後にどう担保するか。
  - 方針: **allowlist を設定ファイル（YAML）で管理し、参照用として扱う**。

## 最終整理（エンドポイント設定の集約先）
- **スキップ用 allowlist.yml**: 認証・認可の対象外とする公開パスを定義（参照用の一次情報）。
- **endpointpermission（DB）**: 認可（権限レベル／ロール）判定に使用。

## 参照ファイル
- `BE/appserver/src/main/java/com/example/appserver/config/JwtSecurityConfig.java`
- `BE/appserver/src/main/java/com/example/appserver/config/SessionSecurityConfig.java`
- `BE/appserver/src/main/java/com/example/appserver/filter/TokenRefreshFilter.java`
- `BE/appserver/src/main/java/com/example/appserver/filter/SessionCheckFilter.java`
- `BE/appserver/src/main/java/com/example/appserver/config/WebConfig.java`
- `BE/appserver/src/main/java/com/example/appserver/interceptor/AuthorizationInterceptor.java`
- `BE/appserver/src/main/java/com/example/appserver/security/JwtAuthenticationFilter.java`
- `BE/appserver/src/main/resources/application-local.yml`

