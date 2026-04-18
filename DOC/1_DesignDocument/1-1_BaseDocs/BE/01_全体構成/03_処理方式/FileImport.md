# ファイル取込設計書（親資料）

## 目的
ファイル取込の全体像を俯瞰し、詳細資料への導線を示す。

## 全体像
- CSV/Excel ファイルをアップロードし、検証・登録を行う。
- 取込履歴は `JobStatus` で管理する。

## アーキテクチャ概要
- `appserver` がアップロードを受け付ける。
- `batchserver` に `fileImportJob` が存在する。
- 共通部品は `servercommon` に集約する。

## 現行の処理経路
- `FileImportController` が `internalApiClient` 経由で `batchserver` の `fileImportJob` を起動する。
- `FileValidationTasklet` は `S3StorageService` を使用する。

## 旧仕様または未使用の経路（要確認）
- `FileImportService` による appserver 内完結処理は Controller 側でコメントアウトされている。
- `FileImportScheduler` から `ImportJobExecutor.execute(file)` はコメントアウトされている。

## 子資料へ分割した内容
- 非同期分類と処理フロー
- 共通部品の役割
- API 仕様
- 設定値
- ストレージ連携
- エラー設計
- JobStatus 定義
- 現行実装との差異と拡張候補

## 参照一覧
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/01_全体構成/03_処理方式/ファイル取込_処理方式設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/ファイル取込_共通部品設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/05_個別機能/ファイル取込_API設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/02_設定値/ファイル取込_設定値定義書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/06_外部連携/ファイル取込_ストレージ連携設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/07_例外処理/ファイル取込_例外設計書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/08_状態_コード定義/ファイル取込_JobStatus定義書.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/ファイル取込_現行実装との差異・拡張候補.md`

## 備考
- 本資料は親資料として残し、詳細は参照先を利用する。
