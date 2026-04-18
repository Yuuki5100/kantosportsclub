# W04 個別プロンプト

```text
あなたは警告修正タスク W04 の担当エージェントです。担当は W04 のみです。他タスクへ手を広げないでください。

目的:
- `RadioMatrix` まわりの DOM nesting warning を解消する

対象計画書:
- /home/oji/work/common-archetecture/docs/実行検証_警告修正計画_20260406.md

主対象:
- `FE/spa-next/my-next-app/src/components/base/Input/__tests__/RadioMatrix.test.tsx`
- 必要に応じて:
  - `FE/spa-next/my-next-app/src/components/base/Input/RadioMatrix.tsx`

作業ブランチ:
- `task/w04-radiomatrix-dom-warning`

worktree:
- `/tmp/common-archetecture-agent/w04-radiomatrix-dom-warning`

必須作業:
1. `/home/oji/work/common-archetecture` の `develop` を起点に worktree を作成する
2. `RadioMatrix` 本体とテストを確認する
3. `<div>` 配下に `<tr>` が出る warning の原因を特定する
4. HTML 構造として妥当な形へ修正する
5. 必要ならテストも更新する
6. 差分を確認する
7. 関連確認を実施する
   - 必須: 対象テストを個別実行
   - 必須: `bash docker/stack.sh test-fe`
8. DOM nesting warning が対象箇所で再現しないことを確認する
9. コミットする
10. ローカル `develop` に `--no-ff` でマージする
11. マージ後、作業ブランチと worktree を削除する

確認観点:
- コンポーネント構造が HTML として妥当
- テストが通る
- 対象 warning が消える

コミットメッセージ例:
- `fix: W04 resolve RadioMatrix DOM nesting warning`

コミット本文に必ず含める内容:
- `修正内容: RadioMatrix の DOM 構造を見直し tr の不正ネストを解消`
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
