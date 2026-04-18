# ✅ バッチ中量ジョブ機能 テスト仕様書（バックエンド）

## 1. 概要

本仕様書は、ファイル取込系の中量ジョブ（`FileImportRunner`, `JobRunnerService`, `JobRunnerController`）に関する**非同期実行処理**および**ジョブ結果の保存処理**の単体テスト仕様を定義するものである。ジョブ成功・失敗、ファイル名異常、バリデーション失敗などの網羅を目的とする。

---

## 2. フォルダ構成

```
src/test/java
└── com/example/appserver
    ├── runner
    │   └── FileImportRunnerTest.java
    ├── service
    │   └── JobRunnerServiceTest.java
    └── controller
        └── JobRunnerControllerTest.java
```

---

## 3. 対象クラス一覧

| クラス                 | 優先度 | 主なテスト観点                                                |
|----------------------|--------|---------------------------------------------------------------|
| `FileImportRunner`   | ⭐⭐⭐    | バリデーション結果による分岐、エラーハンドリング、JobStatus保存処理 |
| `JobRunnerService`   | ⭐⭐☆    | runJob / runDummyJob のジョブステータス保存、例外時の対応     |
| `JobRunnerController`| ⭐⭐☆    | 正常レスポンス、パラメータなし、サービス例外のエラー返却       |

---

## 4. テスト仕様

### 4.1 FileImportRunnerTest

| No | テスト内容                                               | 期待される結果                                |
|----|----------------------------------------------------------|---------------------------------------------|
| 1  | 正常ファイルで保存・バリデーション成功                   | SUCCESSステータスでJobStatusが保存される       |
| 2  | ファイル名がnull                                          | 処理がスキップされ、saveやvalidateが呼ばれない |
| 3  | `getBytes()`でIOException発生                             | catchされ、JobStatus保存も行われない          |
| 4  | バリデーションエラーが1行ある                             | JobStatus.status = "FAILED"、メッセージにRow情報含む |
| 5  | 複数エラー行が存在する                                   | 各行のエラー内容がJobStatusに全て保存される   |
| 6  | 同一行に複数エラーが存在する                             | 同一Row番号で複数行のエラーがメッセージ出力   |

> **補足**: ファイル内容の構造や形式の検証（必須項目や形式）は `FileValidatorDispatcher` に委譲しており、本RunnerではDispatcherからの結果に応じた分岐と保存のみを検証する。

---

### 4.2 JobRunnerServiceTest

| No | メソッド              | テスト内容                                          | 期待される結果                                        |
|----|-----------------------|-----------------------------------------------------|-----------------------------------------------------|
| 1  | `runJob()`            | 正常時にJobStatusがRUNNING→SUCCESSで保存される      | 2回のsaveが呼ばれ、statusやmessageが更新される       |
| 2  | `runJob()`            | 処理中に例外（例：RuntimeException）                | statusがFAILED、例外メッセージがmessageに含まれる    |
| 3  | `runDummyJob()`       | DUMMYジョブが成功                                  | JobType, StatusTypeが適切に設定され、成功として保存  |
| 4  | `runDummyJob()`       | DUMMYジョブで例外発生                              | FAILEDステータスとして保存され、例外メッセージが記録 |

> **補足**：入力値の異常（jobNameが空文字やnull）は呼び出し元のバリデーションに委譲し、Service層では検証を行わない設計。

---

### 4.3 JobRunnerControllerTest

| No | エンドポイント                 | テスト内容                                      | 期待される結果                               |
|----|-------------------------------|-----------------------------------------------|--------------------------------------------|
| 1  | `POST /batch-runner/start`    | jobName指定で正常実行                         | 200 OK、ApiResponse.success=true             |
| 2  | `POST /batch-runner/start`    | jobNameパラメータなし                         | 400 Bad Request、runJobは呼ばれない         |
| 3  | `POST /batch-runner/start`    | ServiceからRuntimeExceptionが発生            | 500 Internal Server Error、error.message含む |
| 4  | `POST /batch-runner/dummy`    | ダミージョブ実行リクエスト                    | 200 OK、runDummyJobが呼び出される           |

---

## 5. モック対象

| クラス                        | 用途                                       |
|-----------------------------|--------------------------------------------|
| `FileValidatorDispatcher`   | バリデーション結果の制御（成功／失敗切替） |
| `JobStatusRepository`       | JobStatusの保存と結果検証                   |
| `FileSaver`                 | ファイル保存処理の呼び出し確認              |
| `JobRunnerService`          | Controllerの依存サービスとしてモック化      |

---

## 6. サンプルレスポンス例

### ✅ ジョブ起動成功
```json
{
  "success": true,
  "data": "ジョブ [import-users] の実行を開始しました",
  "error": null
}
```

### ❌ jobNameなし（400）
```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Bad Request",
  "path": "/batch-runner/start"
}
```

### ❌ サービス例外発生（500）
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "実行時エラー",
    "code": "E500"
  }
}
```

---

## 7. カバレッジ補足

- `FileImportRunner` における InputStream 再利用設計（getBytes→2回）も含めて検証済み。
- `ValidationResult` が複数のエラー・複数行に対応するケースも網羅。
- Controller層ではGlobalExceptionHandlerによるフォーマットされたApiResponseをテスト。

---

## 8. 今後の拡張候補

| 項目                    | 概要                                           |
|-------------------------|------------------------------------------------|
| ファイル種別ごとの分岐 | バリデーションロジックの切替テストの追加       |
| `job_status` の再取得API | `/batch-runner/history` エンドポイントの検証   |
| 非同期実行のテスト       | `@Async` のスレッド切替に関する統合的なテスト |

