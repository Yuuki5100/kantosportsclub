# Sync送信基盤実運用化_仕様書

## 1. 目的

署名付き外部連携を、送信履歴・冪等性・再送制御を備えた送信基盤として共通化する。

## 2. 適用範囲

- 送信側モジュール: `appserver`
- 共通部品: `servercommon`
- 署名送信部品: `syncconnector`（任意。`sync.outbox.use=true` かつ classpath に存在する場合に利用）
- 対象通信: HMAC 署名付き REST POST

## 3. 構成要素

| 区分 | 名称 | 役割 |
| --- | --- | --- |
| Model | `SyncOutboxLog` | 送信履歴保持 |
| Repository | `SyncOutboxLogRepository` | Outbox 永続化 |
| Service | `SyncOutboxService` | 送信予約 |
| Service | `SyncDispatchService` | 実送信 |
| Service | `SyncRetryService` | 再送制御 |
| Utility | `SignedRestTemplate` | 署名付き送信 |

## 4. データ仕様

### 4-1. `sync_outbox_log`

| 項目 | 内容 |
| --- | --- |
| `request_id` | 冪等性キー |
| `request_type` | 連携種別 |
| `payload` | 送信本文 |
| `status` | `PENDING` / `SENT` / `RETRY_WAIT` / `FAILED` |
| `retry_count` | 再送回数 |
| `next_retry_at` | 次回送信時刻 |
| `last_error_message` | 最終エラー |
| `sent_at` | 送信完了時刻 |

## 5. 設定値

| 設定キー | 用途 |
| --- | --- |
| `sync.outbox.use` | 送信基盤の有効 / 無効 (`true` / `false`) |
| `sync.remote.base-url` | 接続先基底 URL |
| `sync.remote.*` | 機能別パス |
| `sync.signed-rest.secret-key` | 送信用共有鍵 |
| `sync.signed-rest.signature-header` | 送信用ヘッダ |
| `sync.outbox.max-retry` | 最大再送回数 |
| `sync.outbox.fixed-delay-ms` | ワーカー起動間隔 |

## 6. 処理フロー

0. `sync.outbox.use=false` の場合は Outbox 登録 / 送信 / 再送を実施しない
1. 業務処理が `SyncOutboxService` に送信要求を登録する
2. Outbox に `PENDING` で保存する
3. `SyncDispatchService` が `SignedRestTemplate`（利用可能時）で送信する
4. 成功時は `SENT` に更新する
5. 失敗時は `retry_count` と `next_retry_at` を更新する
6. 上限到達時は `FAILED` に更新する

## 7. 冪等性仕様

- `request_id` を一意キーとする
- 同一 `request_id` の再登録は拒否または既存返却とする
- 再送は同じ `request_id` を使用する

## 8. 例外・障害時仕様

- 署名生成失敗: 即時失敗
- HTTP 4xx: 原則再送しない
- HTTP 5xx / タイムアウト: 再送対象
- 想定外例外: 失敗記録のうえ再送対象

## 9. テスト観点

- 正常送信
- 重複登録
- 再送成功
- 上限回数超過
- 署名ヘッダ設定差し替え

## 10. 非機能要件

- 送信履歴を監査できる
- 再送ワーカーは停止・再開可能
- 秘密鍵は環境変数や Secrets 管理を前提とする
