# 📄 バッチサーバー（batchserver）テスト仕様書

## 1. 概要

本ドキュメントは、Spring Batch を使用したバッチ処理（重量処理）に対して、適切な単体・統合テストを設計・実装するための仕様書です。ジョブ起動、ステータス管理、エラーハンドリング、定期実行、リスナー連携など、多岐にわたる検証項目を網羅します。

---

## 2. テスト対象一覧

| コンポーネント                  | 概要                            | テスト種別      |
| ------------------------ | ----------------------------- | ---------- |
| `JobController`          | バッチジョブの起動・履歴取得                | コントローラテスト  |
| `BatchService`           | ジョブ名からの実行ディスパッチロジック           | 単体テスト      |
| `JobLauncherController`  | JobRegistry → 実行 → 例外処理       | 統合テスト      |
| `FileImportScheduler`    | ファイル監視 → ImportJobExecutor 実行 | 単体テスト      |
| `CsvUserImportTasklet` 等 | 実データ処理タスクレット                  | バッチステップテスト |
| `BatchJobListener`       | ジョブの成功・失敗通知                   | リスナーテスト    |
| `GlobalExceptionHandler` | エラー応答の標準化                     | 統合テスト      |

---

## 3. テストケース一覧（抜粋）

### 3-1. JobControllerTest

| テスト項目          | 条件                                | 期待結果                            |
| -------------- | --------------------------------- | ------------------------------- |
| 正常にジョブを起動できる   | 有効なジョブ名 `/jobs/run/sampleJob`     | 200 OK / success: true          |
| 不正なジョブ名で起動した場合 | InvalidJobNameException 発生        | 400 BadRequest / エラーコード: E4001  |
| 内部例外が発生した場合    | RuntimeException など               | 500 InternalServerError / E5001 |
| ジョブ履歴取得が成功する   | `/jobs/history?jobName=sampleJob` | 200 OK / jobName, status が含まれる  |

### 3-2. JobLauncherControllerTest

| テスト項目        | 条件                                  | 期待結果                            |
| ------------ | ----------------------------------- | ------------------------------- |
| ジョブの正常起動     | JobRegistry から取得成功 → JobLauncher    | 200 OK / success: true          |
| 未登録ジョブを指定    | NoSuchJobException                  | 400 BadRequest / E4001          |
| 予期せぬ例外       | RuntimeException                    | 500 InternalServerError / E5001 |
| ジョブ実行中       | JobExecutionAlreadyRunningException | 500 InternalServerError / E5001 |
| ジョブすでに完了済    | JobInstanceAlreadyCompleteException | 500 InternalServerError / E5001 |
| 再実行が許可されていない | JobRestartException                 | 500 InternalServerError / E5001 |

### 3-3. FileImportSchedulerTest

| テスト項目            | 条件                           | 期待結果                          |
| ---------------- | ---------------------------- | ----------------------------- |
| 未処理ファイルあり → 処理成功 | `isAlreadyProcessed = false` | `execute()` 呼び出し / success 保存 |
| すでに処理済みのファイル     | `isAlreadyProcessed = true`  | 処理スキップ                        |
| 処理中に例外が発生        | `execute()` が例外をスロー          | `markAsFailed()` 呼び出し         |

### 3-4. BatchServiceTest

| テスト項目      | 条件             | 期待結果                        |
| ---------- | -------------- | --------------------------- |
| 有効なジョブ名で実行 | Job Map に存在    | jobLauncher.run() が1回呼ばれる   |
| 無効なジョブ名    | Job Map に存在しない | IllegalArgumentException 発生 |

---

## 4. テスト構成方針

### 4-1. テストプロファイルの使用

* `@ActiveProfiles("test")` を各テストクラスに付与
* `application-test.yml` で Flyway や通知設定を無効化

### 4-2. モック化の徹底

* `ErrorCodeRepository`, `TeamsNotificationService`, `JobLauncher` などは `@MockBean`
* `JobExecution`, `JobParameters` などはスタブとして生成
* リスナーはテスト対象から除外、もしくは別途単体テスト

---

## 5. 各種補足

### 5-1. エラーハンドリング検証

* `GlobalExceptionHandler` を `@Import` で明示的に読み込むことで、エラーコードとロケールの連携を確認
* 各例外に対して `error.code` / `error.message` を JSON で返却することを検証

### 5-2. ファイルベースのジョブ

* `CsvUserImportTasklet` 等のTaskletベースの処理に対しては、ファイル準備 → 処理 → 検証の流れで統合テストを設計（別紙予定）

### 5-3. 実行ログと監視

* `BatchJobListener` による通知やロギングは、listenerを個別にテスト（Mock TeamsNotificationService を使って `sendNotification` が呼ばれたことを確認）

---

## 6. 今後の拡張

| 項目               | 内容                                    |
| ---------------- | ------------------------------------- |
| Job実行時の並列制御      | 複数ジョブの同時実行とその影響を検証                    |
| Jobパラメータのバリエーション | タイムスタンプ、環境変数、動的ファイル名の指定               |
| ジョブステータスの永続化     | 実行履歴やステータスのDB記録と再取得ロジックの検証            |
| 再実行可能性の確認        | allowStartIfComplete や再実行許可オプションの挙動検証 |

---


## 📁 **7. テストフォルダ構成（推奨構成）**

テスト対象の分類（Controller / Service / Scheduler / Job / Tasklet / Listener）に応じて、明確な階層構造を採用します。

```plaintext
batchserver
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com.example.batchserver
│   │   │       ├── controller
│   │   │       ├── jobs
│   │   │       ├── listener
│   │   │       ├── scheduler
│   │   │       ├── service
│   │   │       └── tasklet
│   └── test
│       └── java
│           └── com.example.batchserver
│               ├── AbstractBatchControllerTest.java   # 共通モック・エラー応答
│               ├── BatchServerTest.java               # 全体共通ベースクラス
│               ├── config
│               │   └── BatchTestConfig.java           # JobLauncherTestUtilsなど
│               ├── controller
│               │   ├── JobControllerTest.java
│               │   └── JobLauncherControllerTest.java
│               ├── scheduler
│               │   └── FileImportSchedulerTest.java
│               ├── service
│               │   └── BatchServiceTest.java
│               ├── jobs
│               │   └── CsvUserImportJobTest.java      
│               ├── tasklet
│               │   └── CsvUserImportTaskletTest.java  # 今後の追加（Step実行検証など）
│               └── listener
│                   └── BatchJobListenerTest.java      # 通知・ログ出力の検証用
```

---

## 📌 補足ルール

| 種別       | 命名規則例                              | 備考                                 |
| -------- | ---------------------------------- | ---------------------------------- |
| コントローラ   | `XXXControllerTest.java`           | `@SpringBootTest + MockMvc` を基本    |
| サービス     | `XXXServiceTest.java`              | 単体テスト中心、JobRegistryの挙動など           |
| スケジューラ   | `XXXSchedulerTest.java`            | ファイル監視系（例: FileImportScheduler）    |
| Tasklet  | `XXXTaskletTest.java`              | Reader/Processor/Writer単位の検証       |
| Listener | `XXXListenerTest.java`             | 通知送信・ロギングのトリガー検証                   |
| 共通設定     | `AbstractBatchControllerTest.java` | エラーコードリポジトリ、MockBean定義など           |
| 全体基底     | `BatchServerTest.java`             | `@SpringBootTest` + 共通設定（必要に応じて継承） |

---
