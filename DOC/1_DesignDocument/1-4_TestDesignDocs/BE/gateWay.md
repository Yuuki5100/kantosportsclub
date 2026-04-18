# 🌐 Spring Cloud Gateway テスト仕様書

## 1. 概要

本テスト仕様書は、Spring Cloud Gatewayに実装された各種機能に対して、ユニットテスト・統合テストを通じた品質担保のためのテスト方針およびケースを定義する。

| 項目        | 内容 |
|-------------|------|
| 対象モジュール | gateway（apigateway） |
| 対象機能     | CORS, 認証フィルタ, IPホワイトリスト, トレースログ, RateLimiter, エラーハンドリング |

---

## 2. テストカテゴリ別仕様

### ✅ 2-1. CORSフィルター (`CorsGlobalConfig`)

| テスト項目                         | 内容 |
|----------------------------------|------|
| テストクラス                     | `CorsGlobalConfigIntegrationTest` / `CorsGlobalConfigTest` |
| 目的                             | CORS設定の有効性とフィルターの構成確認 |
| 主な検証ポイント                 | `OPTIONS`リクエストが許可されたOriginから来た場合許可されること、許可されていないOriginは拒否されること |

| ケースID | テスト名                            | 入力条件                                                | 期待結果                                  |
|----------|-------------------------------------|---------------------------------------------------------|-------------------------------------------|
| CORS-01  | localhost:3000 からのOPTIONSリクエスト | Origin: http://localhost:3000, Method: GET              | ステータス200, CORSヘッダ付与             |
| CORS-02  | 不正なOriginからのリクエスト         | Origin: http://evil.com                                 | ステータス403                             |
| CORS-03  | フィルターBeanが正常生成されること   | コンテナ起動時                                          | CorsWebFilterインスタンスがnullでないこと |

---

### ✅ 2-2. 認証フィルター (`JwtOrSessionAuthFilter`)

| テスト項目 | 内容 |
|------------|------|
| テストクラス | `JwtOrSessionAuthFilterTest` |
| 目的         | JWT認証 or セッション認証処理の正常性と拒否動作の検証 |
| 主な検証内容 | 公開パスの通過、JWT検証、セッションCookie検出、未認証拒否など |

| ケースID | テスト名                                  | 条件                                                                 | 期待結果                         |
|----------|-------------------------------------------|----------------------------------------------------------------------|----------------------------------|
| AUTH-01  | 公開パス `/login` は認証不要               | `request.getPath()` が `/login` 等                                 | 通過                             |
| AUTH-02  | 有効なJWTトークンがある場合許可           | `Authorization: Bearer valid.token`                                 | 通過                             |
| AUTH-03  | 無効なJWTトークンがある場合拒否           | `Authorization: Bearer invalid.token`                               | `UnauthorizedException` 送出     |
| AUTH-04  | JSESSIONID Cookieがある場合許可           | `cookies["JSESSIONID"] = "abc123"`                                  | 通過                             |
| AUTH-05  | JWT/セッションどちらもない場合拒否        | `Authorization` ヘッダーなし・Cookieなし                            | `UnauthorizedException` 送出     |

---

### ✅ 2-3. IPホワイトリストフィルター (`IpWhitelistFilter`)

| テストクラス | `IpWhitelistFilterTest` |
|--------------|--------------------------|
| 目的         | X-Forwarded-For または RemoteAddress によるIP制限の妥当性検証 |

| ケースID | テスト名                                       | 入力条件                                               | 期待結果                |
|----------|------------------------------------------------|--------------------------------------------------------|-------------------------|
| IP-01    | X-Forwarded-Forが許可IPの場合                   | ヘッダーに `127.0.0.1`                                | 通過                     |
| IP-02    | RemoteAddressが許可IPの場合                     | remoteAddress=`192.168.0.1`                            | 通過                     |
| IP-03    | 不許可のIPが来た場合                            | X-Forwarded-For=`8.8.8.8`                              | `ForbiddenException`    |
| IP-04    | IPが取得できない場合                            | `request.getRemoteAddress()` = null                    | `ForbiddenException`    |

---

### ✅ 2-4. トレースログフィルター (`TraceLoggingFilter`)

| テストクラス | `TraceLoggingFilterTest` |
|--------------|---------------------------|
| 目的         | リクエストごとの traceId がヘッダとログ（MDC）に反映されること |

| ケースID | テスト名                               | 条件                                             | 期待結果                            |
|----------|----------------------------------------|--------------------------------------------------|-------------------------------------|
| TRACE-01 | X-Trace-Id がリクエストにない場合       | `request.headers["X-Trace-Id"] = null`           | 新規UUIDが生成される                 |
| TRACE-02 | X-Trace-Id が既にある場合               | `request.headers["X-Trace-Id"] = xxx-123`        | 既存IDがそのまま使われる             |

---

### ✅ 2-5. 共通エラーハンドラー (`CustomGlobalExceptionHandler`)

| テストクラス | `CustomGlobalExceptionHandlerTest` |
|--------------|-------------------------------------|
| 目的         | Unauthorized / Forbidden / Unexpected エラーの統一レスポンスと通知確認 |

| ケースID | テスト名                           | 条件                                | 期待結果                         |
|----------|------------------------------------|-------------------------------------|----------------------------------|
| ERR-01   | 未認証エラー（401）のメッセージ確認 | `UnauthorizedException` 送出        | `status=401`, メッセージ含む     |
| ERR-02   | 禁止エラー（403）のメッセージ確認   | `ForbiddenException` 送出           | `status=403`, メッセージ含む     |
| ERR-03   | バッファ制限エラー                 | `DataBufferLimitException`          | `status=403`, メッセージ確認     |
| ERR-04   | 予期せぬエラーの通知                | `RuntimeException("xxx")` 送出      | `status=500`, Teams通知実施     |

---

### ✅ 2-6. ルーティング (`GatewayRouteConfig`)

| テストクラス | `GatewayRouteConfigTest`, `GatewayRouteConfigIntegrationTest` |
|--------------|-----------------------------------------------------------------|
| 目的         | カスタムルートが適切に登録・取得できること |

| ケースID | テスト名                       | 条件                        | 期待結果                        |
|----------|--------------------------------|-----------------------------|---------------------------------|
| ROUTE-01 | JavaConfig経由の登録確認       | 起動後 `routeLocator.getRoutes()` | appserver, batchserver 等含むこと |

---

### ✅ 2-7. RateLimiter 統合テスト (`RateLimiterIntegrationTest`)

| テストクラス | `RateLimiterIntegrationTest` |
|--------------|-------------------------------|
| 目的         | RequestRateLimiter の正しい応答とスルーの確認（現在Disabled） |

| ケースID | テスト名                         | 条件                           | 期待結果                  |
|----------|----------------------------------|--------------------------------|---------------------------|
| RATE-01  | 10リクエスト以内で正常レスポンス | `/api/app/ratelimit-test` に10回 | 全て200 OK                |

※本テストは `@Disabled` 扱い。環境で本番RateLimiterと切り替えることを前提とする。

---

## 3. テスト実行方法・補足

### 使用プロファイル
- `@ActiveProfiles("test")` により、テスト専用の設定（application-test.yml, ダミーFilter等）を利用

### テスト補助構成
- `DummySecurityBypassFilterConfig`: 認証・IP制御をバイパスするモック
- `DummyRateLimiterConfig`: RateLimiterを常時許可するモック
- `RateLimiterBypassConfig`: `RequestRateLimiter` をダミー `GlobalFilter` で上書き

---

## 4. 今後の改善ポイント（TODO）

- 🔲 `/test-cors` や `/test-error` エンドポイントを本番から排除
- 🔲 Gatewayモジュール単体の CI 対象分離（`gateway-only` profile等）
- 🔲 GlobalFilterのトレース検証（logback-log capture含む）

---
