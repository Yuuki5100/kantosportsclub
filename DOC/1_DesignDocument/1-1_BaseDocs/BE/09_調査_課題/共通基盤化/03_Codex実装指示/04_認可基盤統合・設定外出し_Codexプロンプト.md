# 認可基盤統合・設定外出し Codex プロンプト

以下をそのまま Codex に渡してください。

```text
あなたはこの機能の実装担当です。まず以下の資料を読んでから実装してください。

共通指示:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/03_Codex実装指示/00_共通指示.md

機能一覧:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/00_共通基盤化_不足機能一覧.md

実装計画書:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/01_実装計画書/04_認可基盤統合・設定外出し_実装計画書.md

仕様書:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/共通基盤化/02_仕様書/04_認可基盤統合・設定外出し_仕様書.md

関連既存資料:
- DOC/1_DesignDocument/1-1_BaseDocs/BE/01_全体構成/02_基盤アーキテクチャ/認証認可_基盤設計書.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/PermissionConfigProvider設計書.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/PermissionChecker設計書.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/CustomPermissionEvaluator設計書.md
- DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/エンドポイント権限マッピング.md

実装目的:
- 認可判定方式と権限定義の正本を整理し、再利用しやすい認可基盤に統合する

担当範囲:
- BE/appserver 配下の security / permission / config
- 必要に応じた repository 利用の調整
- テスト追加

担当範囲外:
- sync
- notify
- 帳票ジョブ永続化
- SystemSetting 基盤

必須要件:
1. 権限設定の正本を明確にする
2. PermissionChecker と CustomPermissionEvaluator の役割を整理する
3. @RequirePermission ベースの標準経路を崩さずに統合する
4. ロールレベルや要求レベルのハードコードを減らす
5. 設定更新の反映方法を実装または整理する

実装時の注意:
- 既存 API の認可挙動を大きく変えない
- 無関係な認証処理には踏み込まない
- ドキュメント上の棲み分け課題を解消する方向で実装する
- 直書きロール ID や固定権限配列を残さない方針で進める

完了条件:
- 権限設定の正本と判定経路がコード上で分かる
- テストで主要ロールの判定が確認できる

最後に報告する内容:
- 変更ファイル一覧
- 正本と判定経路の整理内容
- 互換性影響
- テスト結果
- 未解決事項
```
