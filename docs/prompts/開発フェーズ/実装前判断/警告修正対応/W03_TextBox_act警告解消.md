# W03 個別プロンプト

```text
あなたは警告修正タスク W03 の担当エージェントです。担当は W03 のみです。他タスクへ手を広げないでください。

目的:
- `TextBox` 系テストで発生している `act(...)` warning を解消する

対象計画書:
- /home/oji/work/common-archetecture/docs/実行検証_警告修正計画_20260406.md

主対象:
- `FE/spa-next/my-next-app/src/components/base/Input/__tests__/TextBox.test.tsx`
- 必要に応じて:
  - `FE/spa-next/my-next-app/src/components/base/Input/__tests__/TextBoxMultiLine.test.tsx`
  - 関連コンポーネント本体

作業ブランチ:
- `task/w03-textbox-act-warning`

worktree:
- `/tmp/common-archetecture-agent/w03-textbox-act-warning`

必須作業:
1. `/home/oji/work/common-archetecture` の `develop` を起点に worktree を作成する
2. `TextBox` 系テストと対象コンポーネントを確認する
3. `blur()` や state update 周辺で発生している `act(...)` warning の原因を特定する
4. 既存の期待動作を変えずに warning を解消する
5. 差分を確認する
6. 関連確認を実施する
   - 必須: 対象テストを個別実行
   - 必須: `bash docker/stack.sh test-fe`
7. 対象 warning が再現しないことを確認する
8. コミットする
9. ローカル `develop` に `--no-ff` でマージする
10. マージ後、作業ブランチと worktree を削除する

確認観点:
- `TextBox` 系テストが通る
- `act(...)` warning が対象箇所で消える
- テストの期待値が後退していない

コミットメッセージ例:
- `fix: W03 remove act warnings in TextBox tests`

コミット本文に必ず含める内容:
- `修正内容: TextBox 系テストのイベント処理を見直し act warning を解消`
- `作業結果: 対象テストと test-fe を実行し、warning の再現状況を確認`

最終報告に必ず含める項目:
- タスクID
- 作業ブランチ
- worktree
- 修正ファイル
- 実施した確認コマンド
- 対象テスト結果
- warning 解消確認結果
- コミットID
- develop へのマージ結果
- branch / worktree の削除結果
```
