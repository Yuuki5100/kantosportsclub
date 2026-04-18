# JOB_INSTANCE追加API設計書

## 1. 目的
Spring Batch の `BATCH_JOB_INSTANCE` に `ERROR_DISPLAY_TYPE` を登録するためのAPIを提供する。

## 2. ユースケース
- ジョブ実行結果の表示制御のために `ERROR_DISPLAY_TYPE` を登録する。

## 3. API仕様

### 3-1. API一覧
| No | Method | Path | 内容 |
|----|--------|------|------|
| 1 | POST | `/system-transfer/custom-job-instance/apply` | JOB_INSTANCE 追加 |

### 3-2. リクエスト
- `SampleJobInstanceRequest`

| 項目 | 型 | 必須 | 説明 |
|------|----|------|------|
| jobInstanceId | Long | 要確認 | JOB_INSTANCE_ID |
| version | Long | 任意 | VERSION |
| jobName | String | 任意 | JOB_NAME |
| jobKey | String | 任意 | JOB_KEY |
| errorDisplayType | String | 任意 | ERROR_DISPLAY_TYPE |

### 3-3. レスポンス
- `200 OK` のみ（ボディなし）

## 4. 処理フロー
1. `POST /system-transfer/custom-job-instance/apply` を受信する。
2. `SampleJobInstanceRequest` を `CustomJobInstance` に詰め替える。
3. `CustomJobInstanceRepository.save` で `BATCH_JOB_INSTANCE` に保存する。

## 5. モジュール構成
| 種別 | 実装名 | 役割 |
|------|--------|------|
| Controller | `CustomJobInstanceController` | API受信 |
| Service | `CustomJobInstanceService` | 登録処理 |
| Request DTO | `SampleJobInstanceRequest` | リクエスト |
| Entity | `CustomJobInstance` | JOB_INSTANCE |
| Repository | `CustomJobInstanceRepository` | 永続化 |

## 6. 実装との整合
- `CustomJobInstance` は `@GeneratedValue` を使用しておらず、`jobInstanceId` はリクエスト値をそのまま使用する。

## 7. 関連資料
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/06_外部連携/` 配下の該当資料

## 8. 要確認事項
- `jobInstanceId` 重複時の扱い
- 入力バリデーション方針

## 9. 制約・注意事項
- `jobInstanceId` は必須前提である。

## 10. テスト観点
| 観点 | 内容 |
|------|------|
| 登録 | 全項目が保存される |
| 例外 | 重複時・不正入力時の挙動 |

## 11. 更新履歴
| ver | 更新日 | 更新者 | 内容 |
|-----|--------|--------|------|
| 1.0 | 要確認 | 要確認 | テンプレート準拠で全面リライト |
