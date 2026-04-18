# W05 個別プロンプト

```text
あなたは警告修正タスク W05 の担当エージェントです。担当は W05 のみです。他タスクへ手を広げないでください。

目的:
- FE テスト中の不要な `console.log` / `console.error` / `console.warn` を整理し、Jest 出力ノイズを減らす

対象計画書:
- /home/oji/work/common-archetecture/docs/実行検証_警告修正計画_20260406.md

主対象:
- `FE/spa-next/my-next-app/src/utils/__tests__/validateExcelRows.test.ts`
- `FE/spa-next/my-next-app/src/components/CRJ/locationMap/utils/debug-empty-cell-border.test.ts`
- そのほか今回の FE テストログで明らかに不要と判断できる `console.*` ノイズ源

作業ブランチ:
- `task/w05-test-console-noise`

worktree:
- `/tmp/common-archetecture-agent/w05-test-console-noise`

必須作業:
1. `/home/oji/work/common-archetecture` の `develop` を起点に worktree を作成する
2. 不要な `console.*` 出力箇所を確認する
3. 不要ログは削除する
4. 意図的な検証が必要な箇所は、必要に応じて spy / assertion ベースへ置き換える
5. 差分を確認する
6. 関連確認を実施する
   - 必須: 対象テストを個別実行
   - 必須: `bash docker/stack.sh test-fe`
7. Jest 出力のノイズが減ったことを確認する
8. コミットする
9. ローカル `develop` に `--no-ff` でマージする
10. マージ後、作業ブランチと worktree を削除する

確認観点:
- テストの意味を落とさずにログが減っている
- 不要な `console.*` が整理されている
- test-fe が通る

コミットメッセージ例:
- `test: W05 reduce unnecessary console noise`

コミット本文に必ず含める内容:
- `修正内容: FE テストの不要 console 出力を整理`
- `作業結果: 対象テストと test-fe を実行し、ログノイズの減少を確認`

最終報告に必ず含める項目:
- タスクID
- 作業ブランチ
- worktree
- 修正ファイル
- 実施した確認コマンド
- ログノイズ確認結果
- コミットID
- develop へのマージ結果
- branch / worktree の削除結果
```
