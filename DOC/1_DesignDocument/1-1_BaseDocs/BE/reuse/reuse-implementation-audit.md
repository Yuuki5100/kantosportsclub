# BE 再利用ルール調査結果（実装差分）

## 1. 対象
- `BE/appserver`
- `BE/servercommon`
- `BE/syncconnector`（任意導入ルール観点）

## 2. 今回実装に対する監査結果（通知再送制御基盤）

| No | 観点 | 判定 | 内容 |
| --- | --- | --- | --- |
| 1 | 通知状態の永続化 | OK | `notify_queue.status`（`PENDING/RETRY_WAIT/SENT/FAILED`）で管理 |
| 2 | 再送制御 | OK | `max_retry` とバックオフ（`next_attempt_at`）で制御 |
| 3 | 永久失敗保持 | OK | 上限到達時に `FAILED` へ遷移し状態を保持 |
| 4 | eventType互換性 | OK | topic命名は維持、未知eventTypeはWARNで継続送信 |
| 5 | 設定外出し | OK | `notify.queue.scan.*` を `application.yml` / sample yml で管理 |
| 6 | 監査性 | OK | `last_error_message` と時刻情報を保持 |
| 7 | 既存フロー維持 | OK | `NotifyQueuePublisher.publish(String, Long)` を維持 |

## 3. 今回実装に対する監査結果（動的設定解決基盤）

| No | 観点 | 判定 | 内容 |
| --- | --- | --- | --- |
| 1 | 共通取得経路 | OK | `SystemSettingResolver` を追加し、型付き取得APIを提供 |
| 2 | 型変換 | OK | 変換失敗時は共通例外/メッセージルールに従い失敗を明示 |
| 3 | キャッシュ | OK | `SystemSettingCache` と `system.setting.cache.*` 設定で制御 |
| 4 | 更新時反映 | OK | 更新後に `evictAll` でキャッシュを無効化 |
| 5 | 履歴保持 | OK | `system_setting_history` へ更新差分を保存 |
| 6 | 既存API互換 | OK | `SystemSettingController` / `SystemSettingService` の利用経路を維持 |
| 7 | 正本維持 | OK | `system_setting` の単一レコード運用（`id=1`）を継続 |

## 4. 要監視事項
- `notify.queue.scan.fixed-delay-ms` と `limit` の組み合わせで通知遅延が増加しないこと。
- `FAILED` 残件の監視・運用手順（再実行方針）を運用設計へ反映すること。
- `system_setting_history` の肥大化に備えたアーカイブ/保持期間方針を運用設計へ反映すること。
- 動的設定キーの追加時に `SystemSettingKeys` とドキュメントの同時更新を徹底すること。

## 5. 判定
再利用ルールに対して重大な逸脱はなし。今回範囲は「既存資産の再利用 + 必要最小限拡張（通知再送制御/動的設定解決）」で整合している。
