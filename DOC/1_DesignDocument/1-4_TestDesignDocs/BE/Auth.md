# ✅ 認証機能テスト仕様書（バックエンド）

## 1. 概要

本仕様書は、`AuthController` および `AuthService` を中心とした**セッションベース認証機能**に対する単体テスト仕様を定義します。ログイン・ログアウト・認証状態確認の主要フローを対象とし、例外系・未認証状態・認証済み状態の分岐網羅を目的とします。

---

## 2. フォルダ構成

```
src/test/java
└── com/example/appserver
    └── controller
        └── AuthControllerTest.java
    └── service
        └── AuthServiceTest.java
```

---

## 3. 対象クラス一覧

| クラス                     | 優先度 | 主なテスト観点                                     |
|--------------------------|--------|--------------------------------------------------|
| `AuthController`         | ⭐⭐⭐    | リクエスト単位の成功/失敗レスポンス制御、例外系         |
| `AuthService`            | ⭐⭐☆    | ロジック単体（認証成功・失敗、セッション管理、状態確認） |

---

## 4. テスト仕様

### 4.1 AuthServiceTest

| No | メソッド            | テスト内容                                      | 期待される結果                         |
|----|---------------------|-----------------------------------------------|--------------------------------------|
| 1  | `login()`           | 正常な認証情報が与えられた場合                | セッションに認証情報が設定される      |
| 2  | `login()`           | `AuthenticationException` が発生する場合      | 401 を返却、エラーメッセージ付き      |
| 3  | `logout()`          | セッションが存在する場合                       | invalidate() が呼び出され、200を返却 |
| 4  | `logout()`          | セッションが存在しない場合                     | 例外なく処理成功し、200を返却        |
| 5  | `getStatus()`       | 認証済みユーザー (`CustomUserDetails`) の場合 | 200でユーザー情報と権限が返却        |
| 6  | `getStatus()`       | 未認証 (`anonymousUser`) の場合               | 403を返却、エラーコード付き           |
| 7  | `getStatus()`       | Principal が `CustomUserDetails` 以外の場合   | 403を返却、エラーコード付き           |

---

### 4.2 AuthControllerTest

| No | エンドポイント      | テスト内容                                      | 期待される結果                         |
|----|---------------------|-----------------------------------------------|--------------------------------------|
| 1  | `POST /auth/login` | 正常なログインリクエスト                      | 200 OK + メッセージ                   |
| 2  | `POST /auth/login` | 認証失敗（ユーザーが存在しない）             | 401 Unauthorized + エラーコード       |
| 3  | `POST /auth/logout`| セッションあり                               | invalidate() 呼び出し + 200 OK       |
| 4  | `POST /auth/logout`| セッションなし                               | 問題なく 200 OK                       |
| 5  | `GET /auth/status` | 認証済みユーザーあり                         | 200 OK + user + rolePermissions      |
| 6  | `GET /auth/status` | 未認証・anonymousUser                         | 403 Forbidden + エラーコード         |
| 7  | `GET /auth/status` | 認証済みだが principal が無効                 | 403 Forbidden + エラーコード         |

---

## 5. モック対象

| クラス                      | 用途                             |
|---------------------------|----------------------------------|
| `AuthenticationManager`   | 認証成功・失敗の切替              |
| `HttpServletRequest`      | セッション取得・無効化の検証      |
| `ErrorCodeService`        | エラーメッセージ取得              |
| `SecurityContextHolder`   | 認証情報の状態再現                |

---

## 6. サンプルレスポンス例

### ✅ 認証成功
```json
{
  "success": true,
  "data": "✅ Login successful",
  "error": null
}
```

### ❌ 認証失敗（ログイン）
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "E401",
    "message": "認証に失敗しました"
  }
}
```

### ❌ 未認証状態（ステータス）
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "E403",
    "message": "ログインが必要です"
  }
}
```

---

## 7. カバレッジ補足

- `SecurityContextHolder.getContext()` から `null` または `anonymousUser` を返す状況も網羅済み
- `CustomUserDetails` 以外の `principal` に対するフォールバック処理も含む
- 実装のシンプルさからテスト難易度は高くないが、セッション境界/例外分岐の明示が重要

---

## 8. 今後の拡張候補

| 項目               | 概要                                      |
|--------------------|-------------------------------------------|
| JWTベースのログイン | セッション方式との比較テスト                 |
| 2段階認証（2FA）    | コード検証・エラー処理のテスト項目追加         |
| BruteForce防御     | ログイン試行制限時の 429 テスト               |
| Cookie属性検証     | セキュリティ属性（HttpOnly, Secure等）の検証 |

