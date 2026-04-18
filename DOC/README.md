**概要**  
このフォルダは共通基盤のドキュメントを整理して配置しています。

**配置方針**
- 設計・仕様に関する資料は `1_DesignDocument` に配置
- 開発手順・規約・運用ガイドは `2_DevGuides` に配置
- テスト/QAに関する資料は `3_TestQa` に配置
- 詳細な配置判断は `DOC/2_DevGuides/2-2_Rules/ドキュメント配置・仕分けルール.md` を正本とする
- `DOC` 直下には `README.md` 以外を新規配置しない

**構成**

```
1_DesignDocument/
  1-1_BaseDocs/         # 基本設計・画面/API・構成図などの基礎資料
  1-2_GeneratedDocs/    # 自動生成ドキュメント
  1-3_Diffs/            # 差分資料・比較資料
  1-4_TestDesignDocs/   # テスト設計書

2_DevGuides/
  2-1_HowToDevelop/     # 環境構築・日常作業の手順
  2-2_Rules/            # 規約・標準・命名規則・ブランチ戦略
  2-3_DeveloperGuide/   # 開発者向け手引き・実装/運用のガイド
  2-4_GitDocs/          # Git/SVN移行などVCS関連
  2-5_CiCd/             # CI/CDやビルド/デプロイ関連

3_TestQa/
  3-1_Testing/          # テスト手順・証跡・観点表など
```

**補足**
- `1-1_BaseDocs` は現行の正本設計を置く
- `1-2_GeneratedDocs` は自動生成物を置く
- `1-3_Diffs` は差分・比較・移行資料を置く
- `1-4_TestDesignDocs` は設計起点のテスト設計を置く
