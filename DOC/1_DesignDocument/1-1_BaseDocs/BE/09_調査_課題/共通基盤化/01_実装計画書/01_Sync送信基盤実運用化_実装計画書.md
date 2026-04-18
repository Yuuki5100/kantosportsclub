# Sync送信基盤実運用化_実装計画書

## 1. 目的

署名付き送信機能を、監査・冪等性・再送制御を備えた共通基盤として実運用可能にする。
`syncconnector` は利用時のみ接続し、未導入システムでも `appserver` 単体で動作可能にする。

## 2. 対象範囲

- `appserver`
- `servercommon`
- `syncconnector`（利用時のみ。必要最小限の拡張）
- DB 定義 `sync_outbox_log`

## 3. 現状

- `SignedRestTemplate` と受信検証部品は存在する
- 業務送信の呼び出し口がない
- 送信履歴テーブルが未実装
- 冪等性・再送制御が未実装

## 4. 到達目標

- 業務送信を Outbox 経由で実行できる
- 送信結果を DB で追跡できる
- 失敗時に再送可能
- 共有シークレットと送信先設定を外部化できる
- `sync.outbox.use=true/false` で機能有効化を切り替えられる

## 5. 実装ステップ

### Step 1. データモデル整備

- `sync_outbox_log` DDL 追加
- Entity / Repository 作成
- ステータス定義追加

### Step 2. 送信共通サービス整備

- `SyncOutboxService` 作成
- `SyncDispatchService` 作成
- `SignedRestTemplate` 呼び出しを共通化

### Step 3. 冪等性制御

- `request_id` 一意制約
- 二重送信検知
- 再送対象の抽出条件定義

### Step 4. 再送ワーカー追加

- `@Scheduled` で未送信 / 再送待ちを処理
- 最大再送回数と次回送信時刻管理

### Step 5. 業務機能接続

- 1 つ以上の業務イベントから Outbox 登録を呼ぶ
- サンプル送信から業務送信へ置き換える

### Step 6. 監査・運用整備

- 送信結果ログ
- 失敗時メッセージ保存
- 監視対象項目定義

## 6. 成果物

- DDL
- Entity / Repository / Service
- 再送スケジューラ
- 設定値
- 運用手順メモ

## 7. 依存関係

- `SignedRestTemplate`
- `HmacSigner`
- `GlobalExceptionHandler`
- 送信先 API の仕様

## 8. リスク

- 送信先ごとにペイロード差異がある
- 共有鍵のローテーション運用を考慮する必要がある
- 失敗時の再送順序設計が必要

## 9. テスト計画

- 正常送信
- 重複 `request_id`
- 署名エラー
- タイムアウト / 500 系再送
- 最大再送回数到達

## 10. 完了条件

- Outbox 登録から送信完了まで一連で動く
- 送信失敗時に再送される
- 監査ログから送信結果を確認できる
