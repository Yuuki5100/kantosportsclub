# ファイル取込_API設計書

## 1. 目的
ファイル取込APIと、downloadReady/download連携の現行仕様を整理する。

## 2. API一覧

| No | Method | Path | 内容 |
| --- | --- | --- | --- |
| 1 | POST | `/import/templateGet` | テンプレート取得 |
| 2 | POST | `/import/upload` | 取込ファイルアップロード + batch起動 |
| 3 | GET | `/import/history` | 取込履歴取得 |
| 4 | POST | `/import/downloadReady` | 帳票ダウンロード準備 |
| 5 | POST | `/import/download` | 生成済み成果物ダウンロード |

## 3. 主要フロー

### 3-1. `/import/upload`
1. multipart受信
2. `FileSaver.save(...)` で保存
3. `InternalApiClient.post(...)` で batchserver `fileImportJob` 起動
4. `refId`, `extension`, `fileName` を返却

注意:
- batchserver URLは `external.batchserver.url` 設定から解決する。

### 3-2. `/import/downloadReady`
1. `jobName=<extension>-<UUID>` 発行
2. `async_job_execution` に `PENDING` 登録
3. `ReportPollingRunner.runFileOutput(...)` で非同期生成開始
4. `jobName` 返却

### 3-3. `/import/download`
1. `async_job_execution` を `jobName` で検索
2. `status==COMPLETED` を確認
3. `artifact_path` を使って `AsyncJobArtifactService.open(...)` で再取得
4. `InputStreamResource` を返却

## 4. 履歴系
- `/import/history` は既存互換のため `job_status` を参照する。

## 5. 例外時挙動
- ジョブ未登録 / 未完了: `400 Bad Request`
- 成果物読込失敗: `500 Internal Server Error`

## 6. 互換性
- APIパス、主要リクエスト/レスポンス契約は維持。
- 内部実装のみ、`JobStatusCacheWithStream` 前提から永続化前提へ移行。
