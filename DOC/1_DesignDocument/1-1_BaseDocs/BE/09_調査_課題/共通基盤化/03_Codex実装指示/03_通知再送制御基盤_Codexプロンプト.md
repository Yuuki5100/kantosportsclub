# 通知再送制御基盤 Codex プロンプト

以下をそのまま Codex に渡してください。

```text
あなたはこの機能の実装担当です。まず以下の資料を読んでから実装してください。

共通指示:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/03_Codex実装指示/00_共通指示.md

機能一覧:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/00_共通基盤化_不足機能一覧.md

実装計画書:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/01_実装計画書/03_通知再送制御基盤_実装計画書.md

仕様書:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/02_仕様書/03_通知再送制御基盤_仕様書.md

関連既存資料:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/NotifyQueueScanService設計書.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/WebSocketNotificationService設計書.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/06_外部連携/WebSocket連携仕様.md

実装目的:
- notify_queue ベース通知に再送上限、バックオフ、失敗状態管理を追加する

担当範囲:
- BE/appserver 配下の NotifyQueueScanService / WebSocketNotificationService / 関連 controller, service
- 必要に応じた servercommon の model / repository 拡張
- DB migration 追加
- テスト追加

担当範囲外:
- sync outbox
- 帳票ジョブ永続化
- 認可基盤
- SystemSetting 基盤

必須要件:
1. 再送上限を設定可能にする
2. バックオフ制御を入れる
3. 永久失敗状態を保持する
4. eventType の運用を壊さない
5. notify.queue.scan.* 設定を利用し、追加設定も外出しする

実装時の注意:
- 既存の通知成功フローは維持する
- Topic 命名ルールを勝手に変更しない
- 可能なら eventType の定義を enum 等へ寄せる
- 失敗時のログ・メッセージは共通ルールに従う

完了条件:
- 一時失敗が再送される
- 上限到達で失敗確定できる
- テストが追加される

最後に報告する内容:
- 変更ファイル一覧
- 状態遷移仕様
- 追加した migration / 設定値
- テスト結果
- 残課題
```
