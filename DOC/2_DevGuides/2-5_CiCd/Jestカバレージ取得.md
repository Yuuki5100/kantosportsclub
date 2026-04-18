# Jestカバレージ取得

---

## 1. 概要

本ドキュメントは、GitLab CI 上で Jest によるフロントエンドのユニットテストおよびカバレッジ取得処理を自動化するジョブについて記述する。取得されたカバレッジ結果は HTML レポートおよび Excel 形式で出力され、開発プロセスにおける品質指標として活用される。

---

## 2. 仕様

| 項目              | 内容                                                                 |
|-------------------|----------------------------------------------------------------------|
| 対象ステージ      | `build`                                                              |
| 実行イメージ      | `node:20`                                                            |
| 前提ジョブ        | `frontend-build-and-lint` の成果物（アーティファクト）を必要とする |
| 使用ツール        | Jest, Node.js スクリプト (`html-to.js`, `coverage-summary-to-excel.js`) |
| カバレッジ出力形式| `Excel`（XLSX）                                      |
| 保存期間          | `24時間`                                                              |
| 適用ブランチ／MR  | マージリクエスト、`develop`、`release-uat`                          |

---

## 3. ディレクトリ構成

```text
FE/spa-next/my-next-app/
├── coverage/
│   └── coverage-summary.json         # Jest によるカバレッジ情報（JSON形式）
└── scripts/
    ├── html-to.js                    # HTMLレポート生成スクリプト
    ├── jest-report.html              # カバレッジHTMLレポート出力先
    └── coverage-summary-to-excel.js  # Excel変換スクリプト
```

### 3.1. 適用および実行タイミング

**以下の条件を満たす場合に本ジョブ frontend-coverage が実行される**

- マージリクエスト（$CI_MERGE_REQUEST_ID が存在）
- develop ブランチへの push
- release-uat ブランチへの push

ジョブ内では以下の順に処理を実行する：

**対象プロジェクトへ移動（cd FE/spa-next/my-next-app）**
- npm ci により依存パッケージをクリーンインストール
- Jest によるカバレッジ付きテスト実行（npm test -- --coverage）
- HTML レポート生成（node scripts/html-to.js）
- Excel レポート生成（node scripts/coverage-summary-to-excel.js）

### 3.2. パイプラインの実行結果およびレポートについて
ジョブが完了すると、以下のレポートファイルが GitLab CI のアーティファクトとして保存される


| 出力ファイル                           | 説明                             |
| -------------------------------- | ------------------------------ |
| `scripts/jest-report.html`       | Jest カバレッジの HTML レポート（ブラウザ閲覧用） |
| `coverage/coverage-summary.json` | Jest のカバレッジサマリー（JSON形式）        |
| `scripts/coverage-summary.xlsx`  | Excel 形式に変換されたカバレッジ情報（報告書等に活用） |

保存されたアーティファクトは 、**24 時間後に自動削除される。**

---

## 4. カバレッジの取得を行わないディレクトリ
jestのテストが不要だと考えるディレクトリは、テスト＆カバレッジ取得をしないよう設定している

**jest.config.jsにて設定**
```text
FE/spa-next/my-next-app/src
├── stories/
├── pages/
├── lang/
├── utils/file/

```
---

## 5. 補足
### 5.1. 機能拡張方針メモ
コンポーネント単位でカバレッジを取得することは可能だが、テスト単位毎にカバレッジを取得することはJestの仕様上不可能。

### 5.2. Jestをローカルで都度実行時、ログが汚くなる件について
**jest.config.js**の以下の箇所を一時的に「false」にしてください
作業終了後、trueに戻り必ず「npx jest --coverage」コマンドを実行してください

```js
collectCoverage: false,
```

---
