# 帳票出力基盤設計書（親資料）

## 目的
帳票出力基盤の全体像と、同期/非同期出力の実装責務を示す。

## 全体像
- 帳票は PDF または Excel で出力する。
- テンプレートと成果物は `StorageService` 経由で扱う（S3/Local 切替）。
- 同期出力は即時返却、非同期出力は `jobName` + ポーリングで返却する。

## アーキテクチャ概要
- API入口: `ReportController`, `FileImportController`
- 生成中核: `ReportServiceImpl`（`servercommon`）
- 非同期実行: `ReportTypeJudge` + `ReportPollingRunner`
- 状態永続化: `AsyncJobStatusService` (`async_job_execution`)
- 成果物I/O: `AsyncJobArtifactService` + `StorageService`
- 期限切れ掃除: `AsyncJobCleanupService`
- 互換レイヤ: `JobStatusRepository`（既存履歴/既存利用者向け）

## 実装反映ポイント
- 以前の `JobStatusCache` 前提は廃止し、DB永続化を主経路とする。
- `POST /report/job` は `jobName` を返却するだけでなく非同期実行を開始する。
- `GET /report/polling/{jobName}` は `async_job_execution` を主参照とする。
- `POST /import/download` は保存済み成果物をストレージから再取得する。

## 参照一覧
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/01_全体構成/02_基盤アーキテクチャ/AsyncProcess.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/01_全体構成/03_処理方式/帳票出力_処理方式設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/帳票出力基盤_共通部品設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/非同期ジョブ状態永続化_共通部品設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/02_設定値/帳票出力_設定値定義書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/08_状態_コード定義/async_job_execution定義書.md`
