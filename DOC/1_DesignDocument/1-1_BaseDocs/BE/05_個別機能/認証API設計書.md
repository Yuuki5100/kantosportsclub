# 認証API設計書

## 1. 目的
認証APIを個別機能として独立させ、仕様と処理フローを明確化する。

## 2. ユースケース
- ユーザーがログインして認証状態を確立する。
- 認証済みかどうかを確認する。
- ログアウトして認証状態を破棄する。

## 3. API仕様
### 3-1. API一覧
| No | Method | Path | 役割 |
|----|--------|------|------|
| 1 | POST | `/api/auth/login` | ログイン |
| 2 | POST | `/api/auth/logout` | ログアウト |
| 3 | GET | `/api/auth/status` | 認証状態確認 |

### 3-2. リクエスト
#### `POST /api/auth/login`
| 項目 | 型 | 必須 | 説明 |
|------|----|------|------|
| `user_id` | string | 必須 | ユーザーID |
| `password` | string | 必須 | パスワード |

#### リクエスト例
```json
{
  "user_id": "user01",
  "password": "password"
}
```

### 3-3. レスポンス
#### `POST /api/auth/login` 成功例（`auth.type=internal`）
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "authType": "internal",
    "user_id": "user01",
    "givenName": "Taro",
    "surname": "Yamada",
    "email": "taro@example.com",
    "userPermissions": [
      {"permissionId": 101, "permissionName": "...", "statusLevelId": 2}
    ]
  }
}
```

#### `GET /api/auth/status` 成功例
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "userId": "user01",
      "givenName": "Taro",
      "surname": "Yamada",
      "email": "taro@example.com"
    },
    "userPermissions": []
  }
}
```

#### エラー例
- 認証失敗時は `E401` を返却する。
- 未認証時の `status` は `E403` を返却する。

## 4. 処理フロー
1. `AuthController` がリクエストを受け付ける。
2. `AuthService` が `AuthFlow` を選択する。
3. `InternalAuthFlow` または `GbizAuthFlow` が処理を実行する。
4. `ApiResponse` を返却する。

## 5. モジュール構成
| 種別 | 名称 | 役割 |
|------|------|------|
| Controller | `AuthController` | API受付 |
| Service | `AuthService` | 認証フローの切り替え |
| Service | `AuthFlow` / `InternalAuthFlow` / `GbizAuthFlow` | 認証処理本体 |
| Request DTO | `LoginRequest` | ログイン入力 |

## 6. 実装との整合
- 実装上のパスは `/api/auth/*`。
- `LoginRequest` は `user_id` と `password` を保持する。
- `auth.type=gbiz` の場合、`/api/auth/login` は `E400` を返す。
- `refresh` はメソッドが存在するがマッピングがコメントアウトされている。

## 7. 関連資料
- `認証認可_基盤設計書.md`
- `CustomUserDetails設計書.md`

## 8. 要確認事項
- `/api/auth/external-login` と `/api/auth/callback` の扱いを本書に含めるかどうか。
- `refresh` API を公開する運用方針。

## 9. 制約・注意事項
- `auth.type` が未設定の場合は `IllegalStateException` が発生する。
- `security.auth.mode` によりセッション/JWTの挙動が変化する。

## 10. テスト観点
- 正常ログイン時のレスポンス。
- 認証失敗時のエラーハンドリング。
- `status` の認証済み/未認証分岐。
- `auth.type=gbiz` のログイン拒否。

## 11. 更新履歴
| ver | 日付 | 変更内容 |
|-----|------|----------|
| 0.1 | 2025/XX/XX | 初版（分解作成） |
