# ファイル取込（File Import）連携設計（現行実装）

## 1. 概要
AppServer がファイルを受け付け、Storage に保存したうえで BatchServer のジョブを起動し、
検証結果を `job_status` に記録します。結果は API から参照します。

## 2. 構成（責務）
### AppServer
- 受け付け API とジョブ起動
- Storage への保存
- 取込履歴の参照

**主要クラス**
- `BE/appserver/src/main/java/com/example/appserver/controller/FileImportController.java`
- `BE/appserver/src/main/java/com/example/appserver/service/InternalApiClient.java`
- `BE/appserver/src/main/java/com/example/appserver/cache/JobStatusCacheWithStream.java`

### BatchServer
- バッチジョブ実行（ファイル検証）

**主要クラス**
- `BE/batchserver/src/main/java/com/example/batchserver/config/FileImportJobConfig.java`
- `BE/batchserver/src/main/java/com/example/batchserver/tasklet/FileValidationTasklet.java`

### ServerCommon
- 共通 Storage / Validator / JobStatus

**主要クラス**
- `BE/servercommon/src/main/java/com/example/servercommon/service/StorageService.java`
- `BE/servercommon/src/main/java/com/example/servercommon/service/S3StorageService.java`
- `BE/servercommon/src/main/java/com/example/servercommon/service/LocalFileStorageService.java`
- `BE/servercommon/src/main/java/com/example/servercommon/file/FileSaver.java`
- `BE/servercommon/src/main/java/com/example/servercommon/file/FileType.java`
- `BE/servercommon/src/main/java/com/example/servercommon/validation/FileValidatorDispatcher.java`
- `BE/servercommon/src/main/java/com/example/servercommon/model/JobStatus.java`

## 3. API 一覧（AppServer）
- `POST /import/templateGet` テンプレート取得
- `POST /import/upload` 取込ファイルアップロード（ジョブ起動）
- `GET  /import/history` 取込履歴取得
- `POST /import/downloadReady` ダウンロード準備（帳票生成）
- `POST /import/download` 帳票ダウンロード

参照: `BE/appserver/src/main/java/com/example/appserver/controller/FileImportController.java`

## 4. ファイル保存（Storage）
### StorageService
共通 I/F（S3 / Local の切り替えは `storage.type` で制御）。
- `upload`, `listInputFiles`, `getFileByPath`, `markAsSuccess/Failed` など

参照: `BE/servercommon/src/main/java/com/example/servercommon/service/StorageService.java`

### 実装
- S3 実装: `S3StorageService`（`storage.type=s3`）
- Local 実装: `LocalFileStorageService`（`storage.type=local`、未指定時）

参照:
- `BE/servercommon/src/main/java/com/example/servercommon/service/S3StorageService.java`
- `BE/servercommon/src/main/java/com/example/servercommon/service/LocalFileStorageService.java`

## 5. ファイル種別判定とバリデータ
- `FileType.fromFilename()` がプレフィックスと拡張子で判定
- `FileValidatorDispatcher` が `validatorBeanName` によりバリデータを取得

参照:
- `BE/servercommon/src/main/java/com/example/servercommon/file/FileType.java`
- `BE/servercommon/src/main/java/com/example/servercommon/validation/FileValidatorDispatcher.java`

## 6. 処理フロー（現行）
### 6.1 アップロード
`/import/upload` でファイルを受領し、Storage に保存。
保存後に BatchServer のジョブを REST 経由で起動。

参照: `BE/appserver/src/main/java/com/example/appserver/controller/FileImportController.java`

### 6.2 バッチジョブ
`fileImportJob` が `FileValidationTasklet` を実行。
- S3 から対象ファイル取得
- `GenericFileImporter` による検証
- `job_status` に結果保存
- `NotifyQueue` へ通知用イベント登録

参照:
- `BE/batchserver/src/main/java/com/example/batchserver/config/FileImportJobConfig.java`
- `BE/batchserver/src/main/java/com/example/batchserver/tasklet/FileValidationTasklet.java`

### 6.3 取込履歴
`/import/history` で `job_status` を参照。

## 7. JobStatus テーブル
取込結果の状態を保持。

参照:
- `BE/servercommon/src/main/java/com/example/servercommon/model/JobStatus.java`

主な項目:
- `job_name`
- `job_type`
- `status` (`RUNNING` / `SUCCESS` / `FAILED` など)
- `original_file_name`
- `message`
- `start_time` / `end_time`

## 8. Scheduler（補足）
`FileImportScheduler` はストレージをスキャンする実装がありますが、
現行では `importJobExecutor.execute(file)` がコメントアウトされており
**自動取込は実行されません**。

参照: `BE/batchserver/src/main/java/com/example/batchserver/scheduler/FileImportScheduler.java`

## 9. 検証エラーのExcel出力
検証エラーを Excel で出力するユーティリティ。

参照:
- `BE/servercommon/src/main/java/com/example/servercommon/validationtemplate/ValidationErrorExcelExporter.java`

## 10. 関連ファイル
- `BE/appserver/src/main/java/com/example/appserver/controller/FileImportController.java`
- `BE/batchserver/src/main/java/com/example/batchserver/config/FileImportJobConfig.java`
- `BE/batchserver/src/main/java/com/example/batchserver/tasklet/FileValidationTasklet.java`
- `BE/servercommon/src/main/java/com/example/servercommon/service/StorageService.java`
- `BE/servercommon/src/main/java/com/example/servercommon/file/FileSaver.java`
- `BE/servercommon/src/main/java/com/example/servercommon/file/FileType.java`
- `BE/servercommon/src/main/java/com/example/servercommon/validation/FileValidatorDispatcher.java`
- `BE/servercommon/src/main/java/com/example/servercommon/model/JobStatus.java`
- `BE/servercommon/src/main/java/com/example/servercommon/validationtemplate/ValidationErrorExcelExporter.java`
