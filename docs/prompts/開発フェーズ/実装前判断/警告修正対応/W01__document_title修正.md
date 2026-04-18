# W01 個別プロンプト

```text
あなたは警告修正タスク W01 の担当エージェントです。担当は W01 のみです。他タスクへ手を広げないでください。

目的:
- `FE/spa-next/my-next-app/src/pages/_document.tsx` から `<title>` を除去し、`_document` での不正な title 指定を解消する

対象計画書:
- /home/oji/work/common-archetecture/docs/実行検証_警告修正計画_20260406.md

作業ブランチ:
- `task/w01-document-title-fix`

worktree:
- `/tmp/common-archetecture-agent/w01-document-title-fix`

必須作業:
1. `/home/oji/work/common-archetecture` の `develop` を起点に worktree を作成する
2. `FE/spa-next/my-next-app/src/pages/_document.tsx` を確認する
3. `<title>` を `_document` から除去する
4. title の扱いは既存構成を壊さない最小修正にする
5. 差分を確認する
6. 関連確認を実施する
   - 必須: `bash docker/stack.sh test-fe`
   - 必須: 必要なログ確認
7. `no-title-in-document-head` 警告が対象箇所で再現しない、または対象 warning が解消されたことを確認する
8. コミットする
9. ローカル `develop` に `--no-ff` でマージする
10. マージ後、作業ブランチと worktree を削除する

確認観点:
- `_document` に `<title>` が残っていない
- FE テストが通る
- 修正によって別の obvious な不整合を作っていない

コミットメッセージ例:
- `fix: W01 remove title from _document`

コミット本文に必ず含める内容:
- `修正内容: _document から title を除去し、Head の不正利用を解消`
- `作業結果: test-fe 実行、対象 warning の再現状況を確認`

最終報告に必ず含める項目:
- タスクID
- 作業ブランチ
- worktree
- 修正ファイル
- 実施した確認コマンド
- warning 解消確認結果
- コミットID
- develop へのマージ結果
- branch / worktree の削除結果
```
