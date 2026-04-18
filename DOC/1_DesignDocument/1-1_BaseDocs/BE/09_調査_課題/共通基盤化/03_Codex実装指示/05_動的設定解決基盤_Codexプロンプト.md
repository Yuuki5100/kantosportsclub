# 動的設定解決基盤 Codex プロンプト

以下をそのまま Codex に渡してください。

```text
あなたはこの機能の実装担当です。まず以下の資料を読んでから実装してください。

共通指示:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/03_Codex実装指示/00_共通指示.md

機能一覧:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/00_共通基盤化_不足機能一覧.md

実装計画書:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/01_実装計画書/05_動的設定解決基盤_実装計画書.md

仕様書:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/02_仕様書/05_動的設定解決基盤_仕様書.md

関連既存資料:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/SystemSettingResolver.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/EnvironmentVariableResover.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/02_設定値/02_設定値テンプレート.md

実装目的:
- DB に保持するシステム設定を、共通 Resolver から型安全に取得できる動的設定基盤へ拡張する

担当範囲:
- BE/appserver 配下の SystemSetting 関連
- BE/servercommon 配下の設定取得共通部品
- 必要に応じた model / repository / history 追加
- DB migration 追加
- テスト追加

担当範囲外:
- sync
- notify
- 認可
- 帳票ジョブ永続化

必須要件:
1. SystemSettingResolver 相当の共通取得 API を追加する
2. 型変換を提供する
3. キャッシュと更新時無効化を考慮する
4. 変更履歴の保持方針をコードへ反映する
5. 既存の SystemSettingController / Service を極力活かす

実装時の注意:
- 既存の単一レコード構造を完全破壊しない
- 移行しやすい形で Resolver を追加する
- 設定値直参照の横展開は最小限にし、まず基盤を作る
- エラー処理は共通ルールに従う

完了条件:
- 他モジュールから共通 API で設定取得できる
- 型変換とキャッシュが機能する
- テストが追加される

最後に報告する内容:
- 変更ファイル一覧
- Resolver / Cache / History の実装概要
- 追加した migration / 設定値
- テスト結果
- 今後の移行課題
```
