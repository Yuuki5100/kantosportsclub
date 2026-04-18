# 非同期ジョブ状態永続化基盤 Codex プロンプト

以下をそのまま Codex に渡してください。

```text
あなたはこの機能の実装担当です。まず以下の資料を読んでから実装してください。

共通指示:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/03_Codex実装指示/00_共通指示.md

機能一覧:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/00_共通基盤化_不足機能一覧.md

実装計画書:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/01_実装計画書/02_非同期ジョブ状態永続化基盤_実装計画書.md

仕様書:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/02_仕様書/02_非同期ジョブ状態永続化基盤_仕様書.md

関連既存資料:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/01_全体構成/02_基盤アーキテクチャ/AsyncProcess.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/01_全体構成/03_処理方式/帳票出力_処理方式設計書.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/01_全体構成/02_基盤アーキテクチャ/FileExport.md

実装目的:
- 非同期ジョブ状態と生成物を永続化し、再起動後も参照できるようにする

担当範囲:
- BE/appserver 配下の cache / runner / controller の改修
- 必要に応じた BE/servercommon 配下のモデル / repository / service 追加
- DB migration 追加
- テスト追加

担当範囲外:
- sync outbox
- notify_queue 再送制御
- 認可基盤
- SystemSetting 基盤

必須要件:
1. JobStatusCache / JobStatusCacheWithStream のメモリ依存を減らし、永続化へ置き換える
2. 生成ファイルは StorageService で再取得可能にする
3. 既存 API 互換性を極力維持する
4. ジョブ状態の期限切れ削除を考慮する
5. エラー処理は共通ルールに従う

実装時の注意:
- 帳票出力や downloadReady / download 系の既存フローを壊さない
- DB とストレージの整合を考えてトランザクション境界を明示する
- 無関係な帳票仕様の変更はしない

完了条件:
- 再起動後もジョブ状態と成果物を参照できる
- 既存の利用者が jobName ベースで継続利用できる
- テストが追加される

最後に報告する内容:
- 変更ファイル一覧
- 状態永続化の設計概要
- 追加した migration
- テスト結果
- 互換性に関する注意点
```
