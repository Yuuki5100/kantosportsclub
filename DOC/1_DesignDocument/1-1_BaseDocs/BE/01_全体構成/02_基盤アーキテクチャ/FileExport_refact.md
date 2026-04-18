# 帳票出力基盤ドキュメント（親資料 / refact）

## 目的
帳票出力基盤の再構成版として、現行実装との差分を吸収した参照導線を提供する。

## 全体像
- PDF/Excelをテンプレート + DBデータから生成する。
- テンプレート/成果物は `StorageService` で管理する。
- 非同期状態は `async_job_execution` に永続化する。

## アーキテクチャ概要
- 生成処理: `ReportServiceImpl`
- 非同期起動: `ReportTypeJudge`
- 非同期実行: `ReportPollingRunner`
- 状態管理: `AsyncJobStatusService`
- 成果物管理: `AsyncJobArtifactService`
- 期限切れ掃除: `AsyncJobCleanupService`

## 実装整合メモ
- `ReportTypeJudge -> ReportPollingRunner` は実装済み。
- `JobStatusCache` 前提の記述は廃止し、DB永続化へ統一。

## 参照一覧
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/01_全体構成/01_システム全体/帳票出力_全体像設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/01_全体構成/03_処理方式/帳票出力_処理方式設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/帳票出力基盤_共通部品設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/非同期ジョブ状態永続化_共通部品設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/08_状態_コード定義/async_job_execution定義書.md`
