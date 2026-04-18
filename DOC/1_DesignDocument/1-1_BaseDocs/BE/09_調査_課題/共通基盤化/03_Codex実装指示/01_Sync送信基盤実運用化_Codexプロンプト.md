# Sync送信基盤実運用化 Codex プロンプト

以下をそのまま Codex に渡してください。

```text
あなたはこの機能の実装担当です。まず以下の資料を読んでから実装してください。

共通指示:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/03_Codex実装指示/00_共通指示.md

機能一覧:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/00_共通基盤化_不足機能一覧.md

実装計画書:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/01_実装計画書/01_Sync送信基盤実運用化_実装計画書.md

仕様書:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/02_仕様書/01_Sync送信基盤実運用化_仕様書.md

関連既存資料:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/06_外部連携/sync-connector.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/SignedRestTemplate設計書.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/HmacSigner設計書.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/SyncSignatureVerificationInterceptor設計書.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/08_状態_コード定義/sync_outbox_log定義書.md

実装目的:
- HMAC署名付き送信を、送信履歴・冪等性・再送制御を備えた共通基盤へ拡張する

担当範囲:
- BE/appserver 配下の sync 送信利用コード
- BE/servercommon 配下の outbox モデル / repository / service 追加
- BE/syncconnector 配下の送信共通部品の必要最小限の拡張（利用時のみ）
- DB migration 追加
- 対応テスト追加

担当範囲外:
- 認可基盤
- notify_queue 再送制御
- 非同期ジョブ永続化
- SystemSetting 基盤

必須要件:
1. 既存の SignedRestTemplate を再利用し、外部 API 直叩きをしない（`sync.outbox.use=true` の場合）
2. sync_outbox_log の永続化を追加する
3. request_id による冪等性を持たせる
4. 再送回数と次回再送時刻を管理する
5. 送信結果を監査可能にする
6. 設定値は application / env に外出しする（`sync.outbox.use=true/false` で機能切替可能にする）
7. エラーコード、ログ文言、例外文言は既存ルールに従う

実装時の注意:
- 他の Codex も並行作業しているため、無関係なファイルは触らない
- migration は新規ファイルとして追加し、既存 migration を書き換えない
- 共通部品に寄せられるものは servercommon へ寄せる
- appserver の application.yml に既にある sync.remote / sync.outbox 設定も確認する

完了条件:
- Outbox 登録から送信完了まで一連の処理が動く
- 失敗時に再送対象へ遷移する
- 最低限の単体または結合テストが追加される

最後に報告する内容:
- 変更ファイル一覧
- 実装内容
- 追加した設定値
- 追加した migration
- テスト結果
- 未解決事項
```
