# バックエンド メッセージ/ロギング修正計画（2026-03-31）

## 1. 目的
- バックエンド実装に散在するエラーメッセージ/ログ文言の直書きを削減し、再利用可能な形に統一する。
- `ErrorCodeService` を中心とした既存ルールへ揃え、`ApiResponse.error(...)` と例外ハンドリングの一貫性を高める。

## 2. 判定ルール（参照ドキュメント）
- `DOC/2_DevGuides/2-2_Rules/バックエンドコーディング規約.md`
  - `ApiResponse<T>` 統一
  - エラーメッセージは `ErrorCodeService` 等の共通機構から取得
  - `System.out.println` 禁止
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/07_例外処理/LogErrorHandling.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/reuse/anti-patterns.md`

## 3. 事前調査結果（src/main/java）
- `ApiResponse.error` のメッセージ直書き: 55件（14ファイル）
- `log.*("...")` の直書き: 203件（55ファイル）
- `System.out/err.println`: 15件
- `throw new XxxException("...")`: 194件（61ファイル）

## 4. 修正対象一覧（優先度）
## 4.1 優先A（APIレスポンス/例外ハンドリング）
- `BE/servercommon/.../GlobalExceptionHandler.java`
- `BE/appserver/.../ManualController.java`
- `BE/appserver/.../NoticeController.java`
- `BE/appserver/.../FileUploadController.java`
- `BE/appserver/.../BulkReportExportController.java`
- `BE/appserver/.../ReportController.java`
- `BE/appserver/.../ReportTypeJudge.java`
- `BE/appserver/.../AuthController.java`
- `BE/appserver/.../UserController.java`
- `BE/appserver/.../service/auth/InternalAuthFlow.java`
- `BE/appserver/.../service/auth/GbizAuthFlow.java`
- `BE/appserver/.../service/ExternalAuthClient.java`
- `BE/appserver/.../security/OidcTokenValidator.java`

## 4.2 優先B（規約違反の標準出力）
- `BE/appserver/.../CustomUserDetailsService.java`
- `BE/appserver/.../FileImportController.java`
- `BE/appserver/.../script/BootstrapHashPrinter.java`
- `BE/servercommon/.../validationtemplate/mapper/TemplateGetMapper.java`
- `BE/servercommon/.../validationtemplate/rule/RequireEmailUnlessGuest.java`
- `BE/batchserver/.../jobs/SampleJobConfig.java`
- `BE/batchserver/.../config/JobConfigUsingStepBuilder.java`
- `BE/syncconnector/.../sample/SyncRequestSenderSample.java`
- `BE/syncconnector/.../sample/SyncRequestReceiverSampleController.java`

## 4.3 優先C（残タスク）
- `log.*("...")` 直書きが残るサービス/バッチ/共通部品の広範囲置換
- `throw new ...Exception("...")` 直書きの段階的集約
- 静的チェック（`System.out/err` / `ApiResponse.error` 直書き）のCI組み込み

## 5. 実装計画
1. 共通メッセージカタログの新設
   - `BackendMessageCatalog` にエラーコード・ログ文言・例外文言を集約
2. エラーメッセージ解決層の追加
   - `BackendMessageResolver` を追加し `ErrorCodeService` 利用を一本化
3. 優先Aを一括置換
   - `ApiResponse.error` の直書き排除
   - `GlobalExceptionHandler` の定型文言をカタログ参照化
4. 優先Bを一括置換
   - `System.out/err` を `log.*` + カタログ参照へ置換
5. 残件（優先C）を段階実施
   - モジュール単位でログ/例外文言を移行
   - CIガードを追加

## 6. 今回の実施内容（完了）
- 追加
  - `BE/servercommon/src/main/java/com/example/servercommon/message/BackendMessageCatalog.java`
  - `BE/servercommon/src/main/java/com/example/servercommon/message/BackendMessageResolver.java`
  - `BE/scripts/check_message_literals.sh`
- 優先A/Bの主要対象を置換
  - `GlobalExceptionHandler` を含む上記優先A対象ファイル
  - `System.out/err` を含む上記優先B対象ファイル
- 優先Cの第1弾を実施（主要サービス/共通部品）
  - `FileImportService`
  - `MailTemplateAdminController`
  - `AdminController`
  - `RolePermissionService`
  - `UserService`
  - `ManualFileUploadService`
  - `NoticeFileService`
  - `InternalAuthFlow`
  - `S3StorageService`
  - `LocalFileStorageService`
  - `GenericFileImporter`
  - `FileRecordReaderDispatcher`
  - `ExcelRecordReader`
- 優先Cの第2弾を実施（appserver/batchserver/gateway/syncconnector/servercommon 横断）
  - `TokenRefreshFilter` / `AuthProperties` / `SessionCheckFilter`
  - `PermissionConfigProviderImpl` / `EndpointPermissionConfig`
  - `JobRunnerService` / `ReportPollingRunner` / `FileImportRunner`
  - `BatchService` / `JobLauncherController` / `FileValidationTasklet` / `CsvUserImportTasklet`
  - `JwtOrSessionAuthFilter` / `IpWhitelistFilter`
  - `ErrorCodeService` / `ReportServiceImpl` / `BulkReportExportServiceImpl`
  - `MailTemplateEngine` / `MailTemplateRegistry` / `HeaderValidationUtils`
  - 各 enum / util / mapper / rule 周辺
- 再スキャン結果
  - `src/main/java` の `ApiResponse.error(..., "literal")` は解消（コメント行を除く）
  - `src/main/java` の `System.out/err.println` は解消（コメント行を除く）
  - `src/main/java` の `log.*("...")` 直書き: 203件 → 0件
  - `src/main/java` の `throw new ...Exception("...")` 直書き: 194件 → 0件
  - `src/**/*.java`（test 含む）でも `log.*("...")` / `throw new ...Exception("...")` / `ApiResponse.error("...")` / `System.out/err.println` は 0件
  - `BackendMessageCatalog` 参照の未定義・重複定義は 0件
  - 再発防止用に `BE/scripts/check_message_literals.sh` を追加（`src/main/java` を自動検査）
  - `CI/ci-config/backend.yml` の `backend-setup` で `bash BE/scripts/check_message_literals.sh` を実行するように追加

## 7. 検証結果
- `cd BE && mvn -q -DskipTests compile` は、社内依存ライブラリ未解決で停止
  - `jp.co.systembase:*` の解決不可により全体コンパイル不可
  - ローカルでの文法整合は差分確認と再スキャンで確認済み

## 8. 次アクション
1. 社内依存リポジトリ接続環境で `mvn -DskipTests compile` を再実行し、モジュール横断の最終ビルド確認を完了する
