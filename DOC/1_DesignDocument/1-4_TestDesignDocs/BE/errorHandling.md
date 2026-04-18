# 📄 ロギング・エラーハンドリング機能 テスト仕様書（バックエンド編）

---

## ✅ 1. 概要

本仕様書は、共通ロギング・エラーハンドリング・通知機能に関する以下のクラスに対して、ユニットテストで網羅すべき観点を定義します。  
セキュリティ、安定性、運用性を重視し、ロギング内容や例外応答の整形、Teams通知動作などを検証対象とします。

---

## ✅ 2. テスト対象コンポーネント

| クラス名 | 役割 |
|----------|------|
| `ErrorCodeService` | エラーメッセージ多言語取得（DB＋キャッシュ） |
| `GlobalExceptionHandler` | 例外の一元処理とレスポンス統一、通知連携 |
| `TeamsNotificationService` | Microsoft Teams への障害通知送信 |
| `LoggingAspect` | AOPによるログトレース出力 |
| `MaskingConverter` | ログメッセージ中のパスワードをマスキング変換 |

---

## ✅ 3. テストフォルダ構成

```
servercommon
└─src
   └─test
      └─java
         └─com.example.servercommon
            ├─aspect
            │   └─LoggingAspectTest.java
            ├─exception
            │   ├─GlobalExceptionHandlerTest.java
            │   └─TestValidationUtils.java
            ├─notification
            │   └─TeamsNotificationServiceTest.java
            ├─service
            │   └─ErrorCodeServiceTest.java
            └─logging
                └─MaskingConverterTest.java
```

---

## ✅ 4. テストケース仕様

### 🔹 4-1. `ErrorCodeServiceTest`

| ID | テスト内容 | 条件 | 期待結果 |
|----|------------|------|----------|
| EC001 | コード＋ロケールが一致する場合 | `"E4001", "ja"` | メッセージが返る |
| EC002 | 該当コードが存在しない場合 | `"E9999", "en"` | `"Unknown error (code: ...)"` を返す |

---

### 🔹 4-2. `GlobalExceptionHandlerTest`

| ID | テスト内容 | ステータス | エラーコード | Teams通知 |
|-----|-------------|------------|--------------|------------|
| GH001 | `MethodArgumentNotValidException` の整形 | `400` | `E4001` | ❌ |
| GH002 | `AccessDeniedException` の整形 | `403` | `E4031` | ❌ |
| GH003 | `CustomException` の整形 | `400` | `E400` | ❌ |
| GH004 | その他の `Exception` を捕捉 | `500` | `E5001` | ✅ |

補足：バリデーション例外の構築は `TestValidationUtils` を利用。

---

### 🔹 4-3. `TeamsNotificationServiceTest`

| ID | テスト内容 | 条件 | 結果 |
|-----|------------|------|-------|
| TN001 | 正常通知送信 | `RestTemplate.postForEntity()` 呼び出し | 送信が実行される |
| TN002 | 通知失敗時 | 例外スローをシミュレート | ログに記録され、例外は握りつぶされる |

備考：通知先URLは `setter` で注入。

---

### 🔹 4-4. `LoggingAspectTest`

| ID | テスト内容 | 条件 | 結果 |
|-----|------------|------|-------|
| LA001 | 正常時ログ出力と `proceed()` 呼び出し | `JoinPoint` 正常動作 | ログが出力され、戻り値が返る |
| LA002 | `IllegalArgumentException` 発生 | `proceed()` 例外スロー | ログにエラーが出力され、例外が再スローされる |

---

### 🔹 4-5. `MaskingConverterTest`

| ID | テスト内容 | 入力 | 出力期待値 |
|-----|------------|------|-------------|
| MC001 | `password=xxx` のマスキング | `"password=abc123"` | `"password=****"` |
| MC002 | 大文字小文字の混在対応 | `"PASSWORD=abc"` | `"PASSWORD=****"` |
| MC003 | 複数出現時もすべてマスク | `"password=one, Password=two"` | `"password=****, Password=****"` |
| MC004 | パスワードが含まれない | `"username=admin"` | `"username=admin"`（変化なし） |
| MC005 | null メッセージ時 | `null` | `null` |

---

## ✅ 5. 使用技術・ライブラリ

| 技術 | 用途 |
|------|------|
| **JUnit 5** | テスト基盤 |
| **Mockito** | モック・振る舞い定義 |
| **ArgumentCaptor** | 通知メッセージ検証（Teams） |
| **RestTemplate** | 外部呼び出しの検証対象 |
| **AspectJ** | `JoinPoint` モック構築 |
| **SLF4J（ログ）** | ログ出力の動作確認 |

---

## ✅ 6. 実行方法

```bash
# 単体テスト実行（servercommon モジュール）
mvn test -pl servercommon

# カバレッジ確認（Jacoco）
mvn clean verify
open target/site/jacoco/index.html
```

---

## ✅ 7. 拡張・備考

- `ApiResponseAdvice` のレスポンスラッピングの MockMvc テスト
- `logback-spring.xml` に対する出力統合テスト（必要であれば LogCaptor 使用）
- `MaskingConverter` の XML組み込み確認は `logback-test.xml` を使用して統合レベルで行う
- Jacoco による最小カバレッジ閾値制限も対応可（例：80%）

