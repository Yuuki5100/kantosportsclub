# 帳票出力_API設計書

## 1. 目的
帳票出力APIの契約を、現行実装（状態永続化対応）に合わせて定義する。

## 2. ユースケース
- 帳票一覧の取得
- 同期出力（Base64 / バイナリ）
- 非同期出力（jobName返却、ポーリング）

## 3. API一覧

| No | Method | Path | 内容 |
| --- | --- | --- | --- |
| 1 | GET | `/report/list` | 帳票一覧取得 |
| 2 | POST | `/report/export/{type}/file` | 同期出力（Base64） |
| 3 | POST | `/report/download/{type}` | 同期出力（バイナリ） |
| 4 | POST | `/report/job` | 非同期ジョブ起動 |
| 5 | GET | `/report/polling/{jobName}` | 非同期状態参照 |

## 4. 詳細仕様

### 4-1. `POST /report/job`
- Request: `ReportJobRequest(reportId, exportTarget)`
- `exportTarget`: `excelUrl` / `pdfUrl` / `csvUrl`
- Response: `ApiResponse<String>` (`jobName`)
- 処理:
  1. `ReportTypeJudge` が `jobName` 発行
  2. `async_job_execution` に `PENDING` 登録
  3. `ReportPollingRunner` 非同期起動

### 4-2. `GET /report/polling/{jobName}`
- Response: `ApiResponse<Map<String,String>>`
  - `status`: `RUNNING` / `COMPLETED` / `FAILED` / `EXPIRED` / `NONE`
  - `url`: `COMPLETED` 時のダウンロードURL
- 参照順:
  1. `AsyncJobStatusService.findByJobName(jobName)`
  2. 該当なし時のみ `JobStatusRepository.findByJobName(jobName)`

## 5. 状態管理
- 主状態: `async_job_execution` (`AsyncJobExecutionStatus`)
- 互換状態: `job_status` (`RUNNING/SUCCESS/FAILED`)

## 6. 実装との整合
- `POST /report/job` はジョブ起動まで実行済み。
- ポーリングはDB永続化状態を参照し、メモリキャッシュ依存はしない。

## 7. エラー
- `reportId` または `exportTarget` 不正: `E4003`
- `type` 不正: `E4002`
- 生成失敗: `FAILED` で状態保存し、ポーリング応答で判定可能

## 8. 互換性注意点
- `status=SUCCESS`（旧 `job_status`）はポーリングで `COMPLETED` に正規化して返却する。
